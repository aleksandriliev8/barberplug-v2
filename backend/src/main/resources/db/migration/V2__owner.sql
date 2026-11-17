-- The Owner: the only person who can sign in to the admin area (GLOSSARY.md, ADR-0006).
CREATE TABLE owner (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT owner_email_lowercase CHECK (email = lower(email))
);

CREATE UNIQUE INDEX owner_email_key ON owner (email);

-- There is exactly one Owner: a second row is rejected.
CREATE UNIQUE INDEX owner_single_row ON owner ((true));
