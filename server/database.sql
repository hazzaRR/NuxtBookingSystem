CREATE TABLE account (
                         ID SERIAL PRIMARY KEY,
                         Username VARCHAR(100) UNIQUE,
                         Email VARCHAR(100) UNIQUE,
                         Password VARCHAR(100),
                         incorrect_attempts INTEGER NOT NULL DEFAULT 0,
                         locked BOOLEAN NOT NULL DEFAULT false,
                         locked_until TIMESTAMP
);

