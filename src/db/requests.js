import sql from './db.js'

const getDirection = (order) =>
  order === 'desc' ? sql`DESC` : sql`ASC`

const getComparisonOperator = (order) =>
  order === 'desc' ? sql`>` : sql`<`

export const getTop5 = async (levelId, order = 'asc') => {
  const direction = getDirection(order)

  return await sql`
    SELECT steam_id, steam_name, time
    FROM leaderboard
    WHERE level_id = ${levelId}
    ORDER BY time ${direction}
    LIMIT 5
  `
}

export const getGlobalTop5 = async (levelId, order = 'asc') => {
  const direction = getDirection(order)

  return await sql`
    SELECT
				steam_id,
				MAX(steam_name) AS steam_name,
				COUNT(*) AS top1_count
		FROM (
				SELECT DISTINCT ON (level_id)
						level_id,
						steam_id,
						steam_name
				FROM leaderboard
				ORDER BY level_id, time ASC
		) t
		GROUP BY steam_id
		ORDER BY top1_count DESC
		LIMIT 5;
  `
}

export const getAll = async (levelId, order = 'asc') => {
  const direction = getDirection(order)

  return await sql`
    SELECT steam_id, steam_name, time
    FROM leaderboard
    WHERE level_id = ${levelId}
    ORDER BY time ${direction}
  `
}

export const getPlayerRank = async (steamId, levelId, order = 'asc') => {
  const player = await sql`
    SELECT steam_id, steam_name, time
    FROM leaderboard
    WHERE steam_id = ${steamId}
      AND level_id = ${levelId}
  `

  if (!player[0]) return null

  const { time } = player[0]
  const operator = getComparisonOperator(order)

  const countResult = await sql`
    SELECT COUNT(*)::int AS better_count
    FROM leaderboard
    WHERE level_id = ${levelId}
      AND time ${operator} ${time}
  `

  const place = countResult[0].better_count + 1

  return {
    ...player[0],
    place
  }
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
  const direction = getDirection(order)

  const rows = await sql`
    WITH top_per_level AS (
      SELECT DISTINCT ON (level_id)
        level_id,
        steam_id AS top_steam_id
      FROM leaderboard
      ORDER BY level_id, time ${direction}
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

export const getGlobalTopCount = async (steamId) => {
  return await sql`
    SELECT
      steam_id,
      MAX(steam_name) AS steam_name,
      COUNT(*) AS top1_count
    FROM (
      SELECT DISTINCT ON (level_id)
        level_id,
        steam_id,
        steam_name
      FROM leaderboard
      ORDER BY level_id, time ASC
    ) t
    WHERE steam_id = ${steamId}
    GROUP BY steam_id
	`
}

export const submitRecord = async (
  steamId,
  steamName,
  levelId,
  time,
  order = 'asc'
) => {
  const isDesc = order === 'desc'

  return await sql`
    INSERT INTO leaderboard (steam_id, steam_name, level_id, time)
    VALUES (${steamId}, ${steamName}, ${levelId}, ${time})
    ON CONFLICT (steam_id, level_id)
    DO UPDATE SET
      steam_name = EXCLUDED.steam_name,
      time = ${
        isDesc
          ? sql`GREATEST(leaderboard.time, EXCLUDED.time)`
          : sql`LEAST(leaderboard.time, EXCLUDED.time)`
      },
      updated_at = NOW()
  `
}