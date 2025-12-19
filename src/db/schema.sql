CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGSERIAL PRIMARY KEY,

    steam_id BIGINT NOT NULL,
    level_id INT NOT NULL,
    time INT NOT NULL CHECK (time > 0),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT leaderboard_unique_player_level
        UNIQUE (steam_id, level_id)
);

CREATE INDEX idx_leaderboard_level_time
ON leaderboard (level_id, time ASC);

CREATE TABLE IF NOT EXISTS tokens (
    id BIGSERIAL PRIMARY KEY,

    steam_id BIGINT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    CONSTRAINT tokens_unique_steam_id
        UNIQUE (steam_id)
);
