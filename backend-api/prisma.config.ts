import { defineConfig } from 'prisma/config'
import { databaseUrl } from './src/config/database-url.js'

try {
  process.loadEnvFile('.env')
} catch {
  // Environment variables may come from the host instead of a .env file.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --env-file=.env prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl(),
  },
})
