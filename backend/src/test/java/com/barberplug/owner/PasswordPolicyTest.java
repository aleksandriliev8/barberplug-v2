package com.barberplug.owner;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PasswordPolicyTest {

    @Test
    void needsAtLeastTwelveCharacters() {
        assertThat(PasswordPolicy.check("elevenchars")).contains("too_short");
        assertThat(PasswordPolicy.check("twelve-chars")).isEmpty();
        assertThat(PasswordPolicy.check(null)).contains("too_short");
    }

    @Test
    void countsCyrillicLettersAsCharactersButLimitsBytesForBcrypt() {
        assertThat(PasswordPolicy.check("парола-дълга")).isEmpty(); // 12 letters, 23 bytes
        assertThat(PasswordPolicy.check("я".repeat(36))).isEmpty(); // 72 bytes
        assertThat(PasswordPolicy.check("я".repeat(37))).contains("too_long"); // 74 bytes
    }
}
