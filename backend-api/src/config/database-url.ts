/**
 * Builds the MySQL connection string from either DATABASE_URL or the DB_* variables.
 */
export function databaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL) return env.DATABASE_URL

  const user = encodeURIComponent(env.DB_USERNAME ?? 'root')
  const password = env.DB_PASSWORD ? `:${encodeURIComponent(env.DB_PASSWORD)}` : ''
  const host = env.DB_HOST ?? '127.0.0.1'
  const port = env.DB_PORT ?? '3306'
  const database = env.DB_DATABASE ?? 'mangrove_collection_db'

  return `mysql://${user}${password}@${host}:${port}/${database}`
}
