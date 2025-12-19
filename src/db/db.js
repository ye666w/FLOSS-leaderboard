import postgres from 'postgres'

const sql = postgres({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'leaderboards'
})

export default sql