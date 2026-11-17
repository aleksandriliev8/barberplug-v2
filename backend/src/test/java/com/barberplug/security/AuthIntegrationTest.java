package com.barberplug.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.barberplug.IntegrationTest;
import com.barberplug.owner.OwnerRepository;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@IntegrationTest
class AuthIntegrationTest {

    /** From application-test.yml. The email is stored lowercased. */
    private static final String EMAIL = "owner@test.local";
    private static final String PASSWORD = "correct-horse-battery";

    /** Each test signs in from its own IP so the rate limiter never carries over between tests. */
    private static final AtomicInteger NEXT_IP = new AtomicInteger(1);

    @Autowired
    private MockMvc mvc;

    @Autowired
    private OwnerRepository owners;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LoginAttemptLimiter limiter;

    private final String ip = "10.0.0." + NEXT_IP.getAndIncrement();

    /** Failed sign-ins in one test must not count against the Owner's email in the next. */
    @BeforeEach
    void clearFailuresForTheOwnerEmail() {
        limiter.reset("email:" + EMAIL);
    }

    private RequestPostProcessor fromIp() {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    private ResultActions login(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login")
                .with(csrf())
                .with(fromIp())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)));
    }

    private MockHttpSession signIn() throws Exception {
        return (MockHttpSession) login(EMAIL, PASSWORD)
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);
    }

    @Test
    void ownerAccountIsCreatedFromConfigurationOnFirstStart() {
        assertThat(owners.findAll())
                .singleElement()
                .satisfies(owner -> assertThat(owner.getEmail()).isEqualTo(EMAIL));
    }

    @Test
    void signsInIgnoringEmailCaseAndThenKnowsWhoIsSignedIn() throws Exception {
        MockHttpSession session = (MockHttpSession) login("  OWNER@Test.Local ", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andReturn()
                .getRequest()
                .getSession(false);

        mvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    void wrongPasswordAndUnknownEmailGetTheSameAnswer() throws Exception {
        login(EMAIL, "not-the-password")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("invalid_credentials"));
        login("nobody@test.local", PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("invalid_credentials"));
    }

    @Test
    void passwordLongerThanBcryptAcceptsIsJustAWrongPassword() throws Exception {
        login(EMAIL, "x".repeat(100)).andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithoutCsrfTokenIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .with(fromIp())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(EMAIL, PASSWORD)))
                .andExpect(status().isForbidden());
    }

    @Test
    void sixthAttemptAfterFiveFailuresIsRefusedEvenWithTheRightPassword() throws Exception {
        for (int attempt = 0; attempt < LoginAttemptLimiter.MAX_FAILURES; attempt++) {
            login(EMAIL, "wrong-" + attempt).andExpect(status().isUnauthorized());
        }

        login(EMAIL, PASSWORD)
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.error").value("too_many_attempts"));
    }

    @Test
    void adminApiNeedsASignedInOwner() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/owner/password").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutEndsTheSession() throws Exception {
        MockHttpSession session = signIn();

        mvc.perform(post("/api/auth/logout").with(csrf()).session(session)).andExpect(status().isNoContent());

        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void changePasswordChecksTheCurrentPasswordAndTheRules() throws Exception {
        MockHttpSession session = signIn();

        changePassword(session, "wrong-current-password", "a-brand-new-password")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.currentPassword").value("incorrect"));
        changePassword(session, PASSWORD, "short")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.newPassword").value("too_short"));
        changePassword(session, PASSWORD, "я".repeat(40)) // 80 bytes in UTF-8
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.newPassword").value("too_long"));
        changePassword(session, PASSWORD, PASSWORD)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.newPassword").value("same_as_current"));
    }

    @Test
    void changedPasswordWorksForTheNextSignIn() throws Exception {
        MockHttpSession session = signIn();
        String newPassword = "a-brand-new-password";
        try {
            changePassword(session, PASSWORD, newPassword).andExpect(status().isNoContent());

            login(EMAIL, PASSWORD).andExpect(status().isUnauthorized());
            login(EMAIL, newPassword).andExpect(status().isOk());
        } finally {
            restoreOriginalPassword();
        }
    }

    private ResultActions changePassword(MockHttpSession session, String current, String next) throws Exception {
        MockHttpServletRequestBuilder request = put("/api/owner/password")
                .with(csrf())
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"%s\",\"newPassword\":\"%s\"}".formatted(current, next));
        return mvc.perform(request);
    }

    private void restoreOriginalPassword() {
        owners.findByEmail(EMAIL).ifPresent(owner -> {
            owner.changePasswordHash(passwordEncoder.encode(PASSWORD), Instant.now());
            owners.save(owner);
        });
    }
}
