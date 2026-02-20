import { sql } from '../../db/db.js';
const orderDir = (dir) => (dir === 'desc' ? sql.unsafe('DESC') : sql.unsafe('ASC'));
export async function submitRecord(steamId, steamName, levelId, seed, score, recordsDirection = 'asc') {
    const steamIdParam = steamId.toString();
    await sql `
    INSERT INTO players (steamId, steamName)
    VALUES (${steamIdParam}, ${steamName})
    ON CONFLICT (steamId)
    DO UPDATE SET steamName = EXCLUDED.steamName
  `;
    if (recordsDirection === 'asc') {
        await sql `
      INSERT INTO records (steamId, levelId, seed, score)
      VALUES (${steamIdParam}, ${levelId}, ${seed}, ${score})
      ON CONFLICT (steamId, levelId)
      DO UPDATE SET
        seed = EXCLUDED.seed,
        score = EXCLUDED.score,
        updatedAt = NOW()
      WHERE EXCLUDED.score < records.score
    `;
    }
    else {
        await sql `
      INSERT INTO records (steamId, levelId, seed, score)
      VALUES (${steamIdParam}, ${levelId}, ${seed}, ${score})
      ON CONFLICT (steamId, levelId)
      DO UPDATE SET
        seed = EXCLUDED.seed,
        score = EXCLUDED.score,
        updatedAt = NOW()
      WHERE EXCLUDED.score > records.score
    `;
    }
    return 'ok';
}
export async function getRecordsForLevel(levelId, recordsDirection, recordsLimit, steamId) {
    const dir = orderDir(recordsDirection);
    if (recordsLimit == null) {
        return await sql `
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
      SELECT place, "steamName", seed, score
      FROM ranked
      ORDER BY place ASC
    `;
    }
    if (steamId == null) {
        return await sql `
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
      SELECT place, "steamName", seed, score
      FROM ranked
      WHERE place <= ${recordsLimit}
      ORDER BY place ASC
    `;
    }
    const steamIdParam = steamId.toString();
    return await sql `
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
    SELECT place, "steamName", seed, score
    FROM ranked
    WHERE
      place <= ${recordsLimit}
      OR (
        place = (SELECT place FROM me)
        AND place > ${recordsLimit}
      )
    ORDER BY place ASC
  `;
}
export async function getRecordsForPlayer(steamId, recordsDirection, recordsLimit) {
    const dir = orderDir(recordsDirection);
    const steamIdParam = steamId.toString();
    if (recordsLimit == null) {
        return await sql `
      SELECT
        r.levelId AS "levelId",
        r.seed AS seed,
        r.score AS score
      FROM records r
      JOIN players p ON p.steamId = r.steamId
      WHERE r.steamId = ${steamIdParam}
        AND p.isBanned = FALSE
      ORDER BY r.score ${dir}, r.updatedAt ASC, r.levelId ASC
    `;
    }
    return await sql `
    SELECT
      r.levelId AS "levelId",
      r.seed AS seed,
      r.score AS score
    FROM records r
    JOIN players p ON p.steamId = r.steamId
    WHERE r.steamId = ${steamIdParam}
      AND p.isBanned = FALSE
    ORDER BY r.score ${dir}, r.updatedAt ASC, r.levelId ASC
    LIMIT ${recordsLimit}
  `;
}
export async function getPortalCountWithBestRecord(recordsDirection, portalDirection, recordsLimit, steamId) {
    const recordsDir = orderDir(recordsDirection);
    const portalDir = orderDir(portalDirection);
    if (recordsLimit == null) {
        return await sql `
      WITH per_player AS (
        SELECT
          r.steamId AS "steamId",
          p.steamName AS "steamName",
          COUNT(*)::INT AS "portalCount",
          SUM(r.score) AS "totalScore",
          MAX(r.updatedAt) AS "lastUpdated"
        FROM records r
        JOIN players p ON p.steamId = r.steamId
        WHERE p.isBanned = FALSE
        GROUP BY r.steamId, p.steamName
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
      SELECT place, "steamName", "portalCount"
      FROM ranked
      ORDER BY place ASC
    `;
    }
    if (steamId == null) {
        return await sql `
      WITH per_player AS (
        SELECT
          r.steamId AS "steamId",
          p.steamName AS "steamName",
          COUNT(*)::INT AS "portalCount",
          SUM(r.score) AS "totalScore",
          MAX(r.updatedAt) AS "lastUpdated"
        FROM records r
        JOIN players p ON p.steamId = r.steamId
        WHERE p.isBanned = FALSE
        GROUP BY r.steamId, p.steamName
      ),
      ranked AS (
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY "portalCount" ${portalDir}, "totalScore" ${recordsDir}, "lastUpdated" ASC, "steamId" ASC
          ) AS place,
          "steamName",
          "portalCount"
        FROM per_player
      )
      SELECT place, "steamName", "portalCount"
      FROM ranked
      WHERE place <= ${recordsLimit}
      ORDER BY place ASC
    `;
    }
    const steamIdParam = steamId.toString();
    return await sql `
    WITH per_player AS (
      SELECT
        r.steamId AS "steamId",
        p.steamName AS "steamName",
        COUNT(*)::INT AS "portalCount",
        SUM(r.score) AS "totalScore",
        MAX(r.updatedAt) AS "lastUpdated"
      FROM records r
      JOIN players p ON p.steamId = r.steamId
      WHERE p.isBanned = FALSE
      GROUP BY r.steamId, p.steamName
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
    ),
    me AS (
      SELECT place
      FROM ranked
      WHERE "steamId" = ${steamIdParam}
      LIMIT 1
    )
    SELECT place, "steamName", "portalCount"
    FROM ranked
    WHERE
      place <= ${recordsLimit}
      OR (
        place = (SELECT place FROM me)
        AND place > ${recordsLimit}
      )
    ORDER BY place ASC
  `;
}
//# sourceMappingURL=leaderboard.repository.js.map