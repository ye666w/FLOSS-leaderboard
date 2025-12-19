import postgres from 'postgres'

const sql = postgres({
  host: 'db',
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'leaderboards'
})

export default sql