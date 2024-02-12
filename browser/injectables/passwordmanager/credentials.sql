CREATE TABLE IF NOT EXISTS credentials (
    domain TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);