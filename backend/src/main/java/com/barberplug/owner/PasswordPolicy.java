package com.barberplug.owner;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

/** Rules for the Owner's password. BCrypt rejects anything over 72 bytes, so that is the ceiling. */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 12;
    public static final int MAX_BYTES = 72;

    private PasswordPolicy() {}

    /** An error code for the frontend, or empty when the password is acceptable. */
    public static Optional<String> check(String password) {
        if (password == null || password.codePointCount(0, password.length()) < MIN_LENGTH) {
            return Optional.of("too_short");
        }
        if (!fitsBcrypt(password)) {
            return Optional.of("too_long");
        }
        return Optional.empty();
    }

    public static boolean fitsBcrypt(String password) {
        return password.getBytes(StandardCharsets.UTF_8).length <= MAX_BYTES;
    }
}
