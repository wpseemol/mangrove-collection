import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

if (existsSync('.env')) process.loadEnvFile('.env')

const storage = mkdtempSync(join(tmpdir(), 'mangrove-test-'))

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    setupFiles: ['test/setup.ts'],
    // One shared MySQL test database: run files one after another.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      APP_ENV: 'testing',
      APP_DEBUG: 'false',
      APP_URL: 'http://localhost',
      DATABASE_URL: '',
      DB_DATABASE: process.env.DB_TEST_DATABASE ?? 'mangrove_collection_test',
      BCRYPT_ROUNDS: '4',
      LOG_SILENT: 'true',
      MAIL_MAILER: 'log',
      SESSION_SECURE_COOKIE: 'false',
      SESSION_SAME_SITE: 'lax',
      CORS_ALLOWED_ORIGINS: 'https://mangrove-collection.com,https://dashboard.mangrove-collection.com,http://localhost:3000,http://localhost:5173',
      UPLOADS_PATH: join(storage, 'uploads'),
      PUBLIC_STORAGE_PATH: join(storage, 'public'),
      LOG_FILE: join(storage, 'test.log'),
    },
  },
})
