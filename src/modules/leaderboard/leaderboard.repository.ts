import { sql } from '../../db/db.js'
import type {
  LevelRecordRow,
  PortalCountRow,
  PlayerRecordRow,
  RecordsDirection
} from './leaderboard.types.js'

const orderDir = (dir: RecordsDirection) => (dir === 'desc' ? sql.unsafe('DESC') : sql.unsafe('ASC'))

export async function submitRecord(
  steamId: bigint,
  steamName: string,
  levelId: number,
  seed: number,
  score: number,
  recordsDirection: RecordsDirection = 'asc'
): Promise<'ok'> {
  const steamIdParam = steamId.toString()

  await sql`
    INSERT INTO players (steamId, steamName)
    VALUES (${steamIdParam}, ${steamName})
    ON CONFLICT (steamId)
    DO UPDATE SET steamName = EXCLUDED.steamName
  `

  if (recordsDirection === 'asc') {
    await sql`
      INSERT INTO records (steamId, levelId, seed, score)
      VALUES (${steamIdParam}, ${levelId}, ${seed}, ${score})
      ON CONFLICT (steamId, levelId)
      DO UPDATE SET
        seed = EXCLUDED.seed,
        score = EXCLUDED.score,
        updatedAt = NOW()
      WHERE EXCLUDED.score < records.score
    `
  } else {
    await sql`
      INSERT INTO records (steamId, levelId, seed, score)
      VALUES (${steamIdParam}, ${levelId}, ${seed}, ${score})
      ON CONFLICT (steamId, levelId)
      DO UPDATE SET
        seed = EXCLUDED.seed,
        score = EXCLUDED.score,
        updatedAt = NOW()
      WHERE EXCLUDED.score > records.score
    `
  }

  return 'ok'
}

export async function getRecordsForLevel<WithSteamId extends boolean = false>(
  levelId: number,
  recordsDirection: RecordsDirection,
  recordsLimit?: number,
  steamId?: bigint,
  includeSteamId = false as WithSteamId
): Promise<LevelRecordRow<WithSteamId>[]> {
  const dir = orderDir(recordsDirection)
  const selectColumns = includeSteamId
    ? sql`place, "steamId", "steamName", seed, score`
    : sql`place, "steamName", seed, score`

  if (recordsLimit == null) {
    return await sql<LevelRecordRow<WithSteamId>[]>`
      WITH ranked AS (
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY r.score ${dir}, r.updatedAt ASC, r.steamId ASC
          ) AS place,
          p.steamName AS "steamName",
          r.seed AS seed,
          r.score AS score,
          r.steamId AS "steamId"
        FROM records r
        JOIN players p ON p.steamId = r.steamId
        WHERE r.levelId = ${levelId}
          AND p.isBanned = FALSE
      )
      SELECT ${selectColumns}
      FROM ranked
      ORDER BY place ASC
    `
  }

  if (steamId == null) {
    return await sql<LevelRecordRow<WithSteamId>[]>`
      WITH ranked AS (
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY r.score ${dir}, r.updatedAt ASC, r.steamId ASC
          ) AS place,
          p.steamName AS "steamName",
          r.seed AS seed,
          r.score AS score
        FROM records r
        JOIN players p ON p.steamId = r.steamId
        WHERE r.levelId = ${levelId}
          AND p.isBanned = FALSE
      )
      SELECT ${selectColumns}
      FROM ranked
      WHERE place <= ${recordsLimit}
      ORDER BY place ASC
    `
  }

  const steamIdParam = steamId.toString()

  return await sql<LevelRecordRow<WithSteamId>[]>`
    WITH ranked AS (
      SELECT
        ROW_NUMBER() OVER (
          ORDER BY r.score ${dir}, r.updatedAt ASC, r.steamId ASC
        ) AS place,
        p.steamName AS "steamName",
        r.seed AS seed,
        r.score AS score,
        r.steamId AS "steamId"
      FROM records r
      JOIN players p ON p.steamId = r.steamId
      WHERE r.levelId = ${levelId}
        AND p.isBanned = FALSE
    ),
    me AS (
      SELECT place
      FROM ranked
      WHERE "steamId" = ${steamIdParam}
      LIMIT 1
    )
    SELECT ${selectColumns}
    FROM ranked
    WHERE
      place <= ${recordsLimit}
      OR (
        place = (SELECT place FROM me)
        AND place > ${recordsLimit}
      )
    ORDER BY place ASC
  `
}

export async function getRecordsForPlayer<WithSteamId extends boolean = false>(
  steamId: bigint,
  recordsDirection: RecordsDirection,
  recordsLimit?: number,
  includeSteamId = false as WithSteamId
): Promise<PlayerRecordRow<WithSteamId>[]> {
  const dir = orderDir(recordsDirection)
  const steamIdParam = steamId.toString()
  const steamColumn = includeSteamId ? sql`r.steamId AS "steamId",` : sql``

  if (recordsLimit == null) {
    return await sql<PlayerRecordRow<WithSteamId>[]>`
      SELECT
        ${steamColumn}
        r.levelId AS "levelId",
        r.seed AS seed,
        r.score AS score
      FROM records r
      JOIN players p ON p.steamId = r.steamId
      WHERE r.steamId = ${steamIdParam}
        AND p.isBanned = FALSE
      ORDER BY r.score ${dir}, r.updatedAt ASC, r.levelId ASC
    `
  }

  return await sql<PlayerRecordRow<WithSteamId>[]>`
    SELECT
      ${steamColumn}
      r.levelId AS "levelId",
      r.seed AS seed,
      r.score AS score
    FROM records r
    JOIN players p ON p.steamId = r.steamId
    WHERE r.steamId = ${steamIdParam}
      AND p.isBanned = FALSE
    ORDER BY r.score ${dir}, r.updatedAt ASC, r.levelId ASC
    LIMIT ${recordsLimit}
  `
}

export async function getPortalCountWithBestRecord<WithSteamId extends boolean = false>(
  recordsDirection: RecordsDirection,
  portalDirection: RecordsDirection,
  recordsLimit?: number,
  steamId?: bigint,
  includeSteamId = false as WithSteamId
): Promise<PortalCountRow<WithSteamId>[]> {
  const recordsDir = orderDir(recordsDirection)
  const portalDir = orderDir(portalDirection)
  const selectColumns = includeSteamId
    ? sql`place, "steamId", "steamName", "portalCount"`
    : sql`place, "steamName", "portalCount"`
  const rankingCte = sql`
    WITH level_ranked AS (
      SELECT
        r.levelId AS "levelId",
        r.steamId AS "steamId",
        p.steamName AS "steamName",
        r.score AS "score",
        r.updatedAt AS "updatedAt",
        ROW_NUMBER() OVER (
          PARTITION BY r.levelId
          ORDER BY r.score ${recordsDir}, r.updatedAt ASC, r.steamId ASC
        ) AS "levelPlace"
      FROM records r
      JOIN players p ON p.steamId = r.steamId
      WHERE p.isBanned = FALSE
    ),
    leaders AS (
      SELECT
        "steamId",
        "steamName",
        "score",
        "updatedAt"
      FROM level_ranked
      WHERE "levelPlace" = 1
    ),
    per_player AS (
      SELECT
        "steamId",
        "steamName",
        COUNT(*)::INT AS "portalCount",
        SUM("score") AS "totalScore",
        MAX("updatedAt") AS "lastUpdated"
      FROM leaders
      GROUP BY "steamId", "steamName"
    ),
    ranked AS (
      SELECT
        ROW_NUMBER() OVER (
          ORDER BY "portalCount" ${portalDir}, "totalScore" ${recordsDir}, "lastUpdated" ASC, "steamId" ASC
        ) AS place,
        "steamName",
        "portalCount",
        "steamId"
      FROM per_player
    )
  `

  if (recordsLimit == null) {
    return await sql<PortalCountRow<WithSteamId>[]>`
      ${rankingCte}
      SELECT ${selectColumns}
      FROM ranked
      ORDER BY place ASC
    `
  }

  if (steamId == null) {
    return await sql<PortalCountRow<WithSteamId>[]>`
      ${rankingCte}
      SELECT ${selectColumns}
      FROM ranked
      WHERE place <= ${recordsLimit}
      ORDER BY place ASC
    `
  }

  const steamIdParam = steamId.toString()

  return await sql<PortalCountRow<WithSteamId>[]>`
    ${rankingCte},
    me AS (
      SELECT place
      FROM ranked
      WHERE "steamId" = ${steamIdParam}
      LIMIT 1
    )
    SELECT ${selectColumns}
    FROM ranked
    WHERE
      place <= ${recordsLimit}
      OR (
        place = (SELECT place FROM me)
        AND place > ${recordsLimit}
      )
    ORDER BY place ASC
  `
}
