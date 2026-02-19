import postgres from 'postgres'

const sql = postgres({
  host: 'db',
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'leaderboards',

  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})

export default sql