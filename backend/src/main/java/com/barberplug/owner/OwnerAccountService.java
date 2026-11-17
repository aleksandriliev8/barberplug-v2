package com.barberplug.owner;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OwnerAccountService {

    private final OwnerRepository owners;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    OwnerAccountService(OwnerRepository owners, PasswordEncoder passwordEncoder, Clock clock) {
        this.owners = owners;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    /**
     * Changes the signed-in Owner's password.
     *
     * @return field error codes, empty when the password was changed
     */
    @Transactional
    public Map<String, String> changePassword(String email, String currentPassword, String newPassword) {
        Owner owner = owners.findByEmail(Owner.normalizeEmail(email))
                .orElseThrow(() -> new IllegalStateException("Signed-in Owner no longer exists"));

        Map<String, String> errors = new LinkedHashMap<>();
        if (!PasswordPolicy.fitsBcrypt(currentPassword)
                || !passwordEncoder.matches(currentPassword, owner.getPasswordHash())) {
            errors.put("currentPassword", "incorrect");
        }
        PasswordPolicy.check(newPassword).ifPresent(problem -> errors.put("newPassword", problem));
        if (errors.isEmpty() && newPassword.equals(currentPassword)) {
            errors.put("newPassword", "same_as_current");
        }
        if (errors.isEmpty()) {
            owner.changePasswordHash(passwordEncoder.encode(newPassword), clock.instant());
        }
        return errors;
    }
}
