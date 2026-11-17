package com.barberplug.security;

import com.barberplug.owner.Owner;
import com.barberplug.owner.PasswordPolicy;
import com.barberplug.web.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import java.time.Duration;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Owner sign-in. Log out is POST /api/auth/logout, handled by Spring Security (see SecurityConfig). */
@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SessionAuthenticationStrategy sessionStrategy;
    private final SecurityContextRepository contexts;
    private final LoginAttemptLimiter limiter;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    AuthController(
            AuthenticationManager authenticationManager,
            SessionAuthenticationStrategy sessionStrategy,
            SecurityContextRepository contexts,
            LoginAttemptLimiter limiter) {
        this.authenticationManager = authenticationManager;
        this.sessionStrategy = sessionStrategy;
        this.contexts = contexts;
        this.limiter = limiter;
    }

    record LoginRequest(
            @NotNull(message = "required") String email, @NotNull(message = "required") String password) {}

    record OwnerResponse(String email) {}

    /** The frontend calls this once so the XSRF-TOKEN cookie exists before its first POST. */
    @GetMapping("/csrf")
    ResponseEntity<Void> csrf() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest login, HttpServletRequest request, HttpServletResponse response) {
        String email = Owner.normalizeEmail(login.email());
        String[] keys = {"ip:" + request.getRemoteAddr(), "email:" + email};

        Optional<Duration> blocked = limiter.blockedFor(keys);
        if (blocked.isPresent()) {
            long seconds = Math.max(1, blocked.get().toSeconds());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, Long.toString(seconds))
                    .body(ApiError.of("too_many_attempts"));
        }

        Authentication authentication;
        try {
            if (!PasswordPolicy.fitsBcrypt(login.password())) {
                // BCrypt would throw on it; no stored password can be this long anyway.
                throw new BadCredentialsException("Password longer than BCrypt accepts");
            }
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, login.password()));
        } catch (AuthenticationException failed) {
            limiter.recordFailure(keys);
            // Same answer for a wrong email and a wrong password.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of("invalid_credentials"));
        }

        limiter.reset(keys);
        sessionStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = holder.createEmptyContext();
        context.setAuthentication(authentication);
        holder.setContext(context);
        contexts.saveContext(context, request, response);
        return ResponseEntity.ok(new OwnerResponse(authentication.getName()));
    }

    /** Who is signed in; 401 when nobody is. */
    @GetMapping("/me")
    OwnerResponse me(Principal principal) {
        return new OwnerResponse(principal.getName());
    }
}
