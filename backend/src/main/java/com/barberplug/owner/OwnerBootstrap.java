package com.barberplug.owner;

import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** Creates the Owner account from environment variables the first time the app starts. */
@Component
class OwnerBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OwnerBootstrap.class);

    private final OwnerRepository owners;
    private final OwnerProperties properties;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    OwnerBootstrap(
            OwnerRepository owners, OwnerProperties properties, PasswordEncoder passwordEncoder, Clock clock) {
        this.owners = owners;
        this.properties = properties;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (owners.count() > 0) {
            return;
        }
        if (!StringUtils.hasText(properties.email()) || properties.initialPassword() == null) {
            throw new IllegalStateException(
                    "No Owner account exists yet. Set OWNER_EMAIL and OWNER_INITIAL_PASSWORD to create it.");
        }
        PasswordPolicy.check(properties.initialPassword()).ifPresent(problem -> {
            throw new IllegalStateException("OWNER_INITIAL_PASSWORD is not acceptable: " + problem
                    + " (at least " + PasswordPolicy.MIN_LENGTH + " characters, at most "
                    + PasswordPolicy.MAX_BYTES + " bytes).");
        });

        Owner owner = new Owner(
                properties.email(), passwordEncoder.encode(properties.initialPassword()), clock.instant());
        owners.save(owner);
        log.info("Created the Owner account for {}", owner.getEmail());
    }
}
