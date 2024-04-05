import { createPool } from 'mysql2/promise'
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME } from './config.js'

export const pool = createPool({
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USERNAME
})
