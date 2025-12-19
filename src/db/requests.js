import sql from './db.js'

export async function saveAuthToken(steamId, token, expiresAt) {
  await sql`
    INSERT INTO tokens (steam_id, token, expires_at)
    VALUES (${steamId}, ${token}, ${expiresAt})
    ON CONFLICT (steam_id)
    DO UPDATE SET
      token = EXCLUDED.token,
      expires_at = EXCLUDED.expires_at
  `
}

export async function verifyAuthToken(steamId, token) {
  const rows = await sql`
    SELECT token
    FROM tokens
    WHERE steam_id = ${steamId}
      AND token = ${token}
      AND expires_at > NOW()
  `
  return rows.length > 0
    ? { success: true }
    : { success: false }
}

export async function getTop5(levelId) {
  return await sql`
    SELECT steam_id, time
    FROM leaderboard
    WHERE level_id = ${levelId}
    ORDER BY time ASC
    LIMIT 5
  `
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
    WHERE steam_id = ${steamId}
      AND level_id = ${levelId}
  `
  return rows[0]?.time ?? null
}

export async function submitRecord(steamId, levelId, time) {
  return await sql`
    INSERT INTO leaderboard (steam_id, level_id, time)
    VALUES (${steamId}, ${levelId}, ${time})
    ON CONFLICT (steam_id, level_id)
    DO UPDATE SET
      time = LEAST(leaderboard.time, EXCLUDED.time),
      updated_at = NOW()
  `
}