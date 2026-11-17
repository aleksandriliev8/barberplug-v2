package com.barberplug.owner;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Locale;

/** The business owner and the only person who can sign in to the admin area. */
@Entity
@Table(name = "owner")
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Owner() {
        // for JPA
    }

    public Owner(String email, String passwordHash, Instant now) {
        this.email = normalizeEmail(email);
        this.passwordHash = passwordHash;
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Emails are stored lowercased so sign-in ignores case. */
    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public void changePasswordHash(String newHash, Instant now) {
        this.passwordHash = newHash;
        this.updatedAt = now;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
