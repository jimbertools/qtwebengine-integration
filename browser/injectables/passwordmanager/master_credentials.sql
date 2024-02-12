CREATE TABLE IF NOT EXISTS master_credentials (
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
);