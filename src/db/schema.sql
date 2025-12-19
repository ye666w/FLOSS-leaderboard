CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGSERIAL PRIMARY KEY,

    steam_id VARCHAR(32) NOT NULL,
    level_id INT NOT NULL,

    time INT NOT NULL CHECK (time > 0),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_records_player_level
ON leaderboard (steam_id, level_id);

CREATE INDEX idx_records_level_time
ON leaderboard (level_id, time ASC);
