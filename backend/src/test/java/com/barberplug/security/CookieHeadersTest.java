package com.barberplug.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.barberplug.TestcontainersConfiguration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Checks the real Set-Cookie headers from Tomcat. MockMvc is not used here: its csrf() helper
 * swaps the CSRF repository, and its cookie formatting differs from a real server.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class CookieHeadersTest {

    @Autowired
    private TestRestTemplate rest;

    @Test
    void csrfCookieIsReadableByTheFrontendButSecureAndSameSite() {
        ResponseEntity<Void> response = rest.getForEntity("/api/auth/csrf", Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        String cookie = findCookie(response.getHeaders().get(HttpHeaders.SET_COOKIE), "XSRF-TOKEN");
        assertThat(cookie).contains("Secure").contains("SameSite=Lax").doesNotContain("HttpOnly");
    }

    @Test
    void sessionCookieIsHttpOnlySecureAndSameSite() {
        ResponseEntity<Void> csrf = rest.getForEntity("/api/auth/csrf", Void.class);
        String csrfCookie = findCookie(csrf.getHeaders().get(HttpHeaders.SET_COOKIE), "XSRF-TOKEN");
        String token = csrfCookie.substring("XSRF-TOKEN=".length(), csrfCookie.indexOf(';'));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("X-XSRF-TOKEN", token);
        headers.add(HttpHeaders.COOKIE, "XSRF-TOKEN=" + token);
        ResponseEntity<String> login = rest.exchange(
                "/api/auth/login",
                HttpMethod.POST,
                new HttpEntity<>("{\"email\":\"owner@test.local\",\"password\":\"correct-horse-battery\"}", headers),
                String.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        String session = findCookie(login.getHeaders().get(HttpHeaders.SET_COOKIE), "BP_SESSION");
        assertThat(session).contains("HttpOnly").contains("Secure").contains("SameSite=Lax");
    }

    private static String findCookie(List<String> setCookies, String name) {
        assertThat(setCookies).as("Set-Cookie headers").isNotNull();
        return setCookies.stream()
                .filter(cookie -> cookie.startsWith(name + "="))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No " + name + " cookie in " + setCookies));
    }
}
