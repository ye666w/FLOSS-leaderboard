CREATE TABLE IF NOT EXISTS players (
    steamId BIGINT PRIMARY KEY,
    steamName TEXT NOT NULL,
    isBanned BOOLEAN DEFAULT FALSE,
    registeredAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
    steamId BIGINT NOT NULL,
    levelId INT NOT NULL,
    seed INT NOT NULL,
    score INT NOT NULL CHECK (score > 0),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (steamId, levelId),

    FOREIGN KEY (steamId)
        REFERENCES players(steamId)
        ON DELETE CASCADE
);

CREATE INDEX idx_records_level_score
ON records (levelId, score)
INCLUDE (steamId);