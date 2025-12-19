import sql from './db.js'

export async function getTop5(levelId) {
  const rows = await sql`
    SELECT *
    FROM leaderboard
    WHERE level_id = ${levelId}
    ORDER BY time ASC
    LIMIT 5
  `
  return rows
}

export async function getPlayerRank(steamId, levelId) {
  const rows = await sql`
    SELECT place FROM (
      SELECT
        steam_id,
        RANK() OVER (ORDER BY time ASC) AS place
      FROM leaderboard
      WHERE level_id = ${levelId}
    ) t
    WHERE steam_id = ${steamId}
  `
  return rows[0]?.place ?? null
}

export async function getPlayerRecord(steamId, levelId) {
  const rows = await sql`
    SELECT time
    FROM leaderboard
    WHERE steam_id = ${steamId} AND level_id = ${levelId}
  `
  return rows[0]?.time ?? null
}

export async function submitRecord(steamId, levelId, time) {
  await sql`
    INSERT INTO leaderboard (steam_id, level_id, time)
    VALUES (${steamId}, ${levelId}, ${time})
    ON CONFLICT (steam_id, level_id)
    DO UPDATE SET
      time = LEAST(leaderboard.time, EXCLUDED.time),
      updated_at = NOW()
  `
}