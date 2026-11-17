package com.barberplug.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LoginAttemptLimiterTest {

    /** A clock the test moves forward by hand. */
    private static final class ManualClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T10:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }

    private final ManualClock clock = new ManualClock();
    private final LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);

    private void fail(int times, String... keys) {
        for (int i = 0; i < times; i++) {
            limiter.recordFailure(keys);
        }
    }

    @Test
    void allowsAttemptsBelowTheLimit() {
        fail(LoginAttemptLimiter.MAX_FAILURES - 1, "ip:1");

        assertThat(limiter.blockedFor("ip:1")).isEmpty();
    }

    @Test
    void blocksAtTheLimitUntilTheOldestFailureAgesOut() {
        fail(LoginAttemptLimiter.MAX_FAILURES, "ip:1");

        assertThat(limiter.blockedFor("ip:1")).contains(LoginAttemptLimiter.WINDOW);

        clock.advance(LoginAttemptLimiter.WINDOW.minusMinutes(1));
        assertThat(limiter.blockedFor("ip:1")).contains(Duration.ofMinutes(1));

        clock.advance(Duration.ofMinutes(1));
        assertThat(limiter.blockedFor("ip:1")).isEmpty();
    }

    @Test
    void anyBlockedKeyBlocksTheAttempt() {
        fail(LoginAttemptLimiter.MAX_FAILURES, "email:owner@test.local");

        assertThat(limiter.blockedFor("ip:2", "email:owner@test.local")).isPresent();
        assertThat(limiter.blockedFor("ip:2", "email:other@test.local")).isEmpty();
    }

    @Test
    void resetClearsTheCount() {
        fail(LoginAttemptLimiter.MAX_FAILURES, "ip:1");

        limiter.reset("ip:1");

        assertThat(limiter.blockedFor("ip:1")).isEmpty();
    }
}
