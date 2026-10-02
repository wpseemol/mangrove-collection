import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { afterAll, afterEach, beforeEach, vi } from 'vitest'
import { databaseUrl } from '../src/config/database-url.js'
import { paths } from '../src/lib/paths.js'
import { prisma } from '../src/lib/prisma.js'
import { resetRateLimits } from '../src/middleware/rate-limit.js'
import { google } from '../src/services/google.js'
import { outbox } from '../src/services/mail.js'
import { settings } from '../src/services/settings.js'
import { smsOutbox } from '../src/services/sms.js'

if (!/test/i.test(new URL(databaseUrl()).pathname)) throw new Error('Tests must run against a database whose name contains "test".')

let tables: string[] | undefined

beforeEach(async () => {
  tables ??= (
    await prisma.$queryRaw<{ name: string }[]>`
      SELECT TABLE_NAME AS name FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME <> '_prisma_migrations'`
  ).map((row) => row.name)

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
    for (const table of tables!) await tx.$executeRawUnsafe(`DELETE FROM \`${table}\``)
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
  })

  // Storage::fake(): both disks live in a temp directory while testing.
  for (const disk of [paths.uploads, paths.publicStorage]) if (disk.startsWith(tmpdir())) rmSync(disk, { recursive: true, force: true })

  resetRateLimits()
  settings.flush()
  outbox.length = 0
  smsOutbox.length = 0
  google.fake()
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(async () => {
  await prisma.$disconnect()
})
