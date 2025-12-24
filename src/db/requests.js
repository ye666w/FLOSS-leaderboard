import sql from './db.js'

export const saveAuthToken = async (steamId, token, expiresAt) => {
  await sql`
    INSERT INTO tokens (steam_id, token, expires_at)
    VALUES (${steamId}, ${token}, ${expiresAt})
    ON CONFLICT (steam_id)
    DO UPDATE SET
      token = EXCLUDED.token,
      expires_at = EXCLUDED.expires_at
  `
}

export const verifyAuthToken = async (steamId, token) => {
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

export const getTop5 = async (levelId, order = 'asc') => {
  return await sql`
    SELECT steam_id, steam_name, time
    FROM leaderboard
    WHERE level_id = ${levelId}
    ORDER BY
      CASE
        WHEN ${order} = 'asc' THEN time
        ELSE -time
      END ASC
    LIMIT 5
  `
}

export const getPlayerRank = async (steamId, levelId, order = 'asc') => {
  const rows = await sql`
    SELECT steam_id, steam_name, time, place FROM (
      SELECT
        steam_id,
        steam_name,
        time,
        RANK() OVER (
          ORDER BY
            CASE
              WHEN ${order} = 'asc' THEN time
              ELSE -time
            END ASC
        ) AS place
      FROM leaderboard
      WHERE level_id = ${levelId}
    ) t
    WHERE steam_id = ${steamId}
  `
  return rows[0] ?? null
}

export const getPlayerRecord = async (steamId, levelId) => {
  const rows = await sql`
    SELECT time
    FROM leaderboard
    WHERE steam_id = ${steamId}
      AND level_id = ${levelId}
  `
  return rows[0]?.time ?? null
}

export const getPlayerTopStatusByLevels = async (
  steamId,
  order = 'asc'
) => {
  const rows = await sql`
    WITH top_per_level AS (
      SELECT DISTINCT ON (level_id)
        level_id,
        steam_id AS top_steam_id
      FROM leaderboard
      ORDER BY
        level_id,
        CASE
          WHEN ${order} = 'asc' THEN time
          ELSE -time
        END ASC
    )
    SELECT
      l.level_id,
      (t.top_steam_id = ${steamId}) AS is_top
    FROM (
      SELECT DISTINCT level_id
      FROM leaderboard
    ) l
    LEFT JOIN top_per_level t
      ON t.level_id = l.level_id
    ORDER BY l.level_id
  `

  return rows.map(r => ({
    levelId: r.level_id,
    isTop: r.is_top
  }))
}

export const submitRecord = async (
  steamId,
  steamName,
  levelId,
  time,
  order = 'asc'
) => {
  return await sql`
    INSERT INTO leaderboard (steam_id, steam_name, level_id, time)
    VALUES (${steamId}, ${steamName}, ${levelId}, ${time})
    ON CONFLICT (steam_id, level_id)
    DO UPDATE SET
      steam_name = EXCLUDED.steam_name,
      time = CASE
        WHEN ${order} = 'asc'
          THEN LEAST(leaderboard.time, EXCLUDED.time)
        ELSE
          GREATEST(leaderboard.time, EXCLUDED.time)
      END,
      updated_at = NOW()
  `
}