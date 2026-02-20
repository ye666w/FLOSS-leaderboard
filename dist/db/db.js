import postgres from 'postgres';
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DATABASE_URL } = process.env;
export const sql = DATABASE_URL
    ? postgres(DATABASE_URL, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10
    })
    : postgres({
        host: DB_HOST ?? 'db',
        port: DB_PORT ? Number(DB_PORT) : 5432,
        username: DB_USER ?? 'postgres',
        password: DB_PASSWORD ?? '',
        database: DB_NAME ?? 'postgres',
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10
    });
//# sourceMappingURL=db.js.map