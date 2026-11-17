package com.barberplug.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Slows down password guessing (ADR-0006): after {@value #MAX_FAILURES} failed sign-ins within
 * {@link #WINDOW}, further attempts for the same IP or the same email are refused until the
 * oldest failure ages out.
 *
 * <p>Kept in memory: production runs a single backend task. With several tasks each would count
 * on its own, which still limits guessing but more loosely.
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 5;
    static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int PRUNE_ALL_ABOVE_KEYS = 10_000;

    private final Clock clock;
    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    /** How long until another attempt is allowed, or empty when the attempt may go ahead. */
    public Optional<Duration> blockedFor(String... keys) {
        Instant now = clock.instant();
        Duration longest = Duration.ZERO;
        for (String key : keys) {
            Deque<Instant> times = failures.get(key);
            if (times == null) {
                continue;
            }
            synchronized (times) {
                prune(times, now);
                if (times.size() >= MAX_FAILURES) {
                    Duration wait = Duration.between(now, times.peekFirst().plus(WINDOW));
                    if (wait.compareTo(longest) > 0) {
                        longest = wait;
                    }
                }
            }
        }
        return longest.isZero() ? Optional.empty() : Optional.of(longest);
    }

    public void recordFailure(String... keys) {
        Instant now = clock.instant();
        if (failures.size() > PRUNE_ALL_ABOVE_KEYS) {
            pruneAll(now);
        }
        for (String key : keys) {
            Deque<Instant> times = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
            synchronized (times) {
                prune(times, now);
                times.addLast(now);
            }
        }
    }

    public void reset(String... keys) {
        for (String key : keys) {
            failures.remove(key);
        }
    }

    private void pruneAll(Instant now) {
        failures.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                prune(entry.getValue(), now);
                return entry.getValue().isEmpty();
            }
        });
    }

    private static void prune(Deque<Instant> times, Instant now) {
        Instant cutoff = now.minus(WINDOW);
        while (!times.isEmpty() && !times.peekFirst().isAfter(cutoff)) {
            times.removeFirst();
        }
    }
}
