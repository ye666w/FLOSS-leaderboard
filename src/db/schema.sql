CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGSERIAL PRIMARY KEY,

    steam_id BIGINT NOT NULL,
    steam_name TEXT NOT NULL,

    level_id INT NOT NULL,
    time INT NOT NULL CHECK (time > 0),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT leaderboard_unique_player_level
        UNIQUE (steam_id, level_id)
);

CREATE INDEX idx_leaderboard_level_time
ON leaderboard (level_id, time)
INCLUDE (steam_id, steam_name);