package com.barberplug.owner;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Used only on first start, while no Owner exists yet (ADR-0006).
 * After that the Owner changes the password in the admin area and these values are ignored.
 */
@ConfigurationProperties(prefix = "barberplug.owner")
public record OwnerProperties(String email, String initialPassword) {}
