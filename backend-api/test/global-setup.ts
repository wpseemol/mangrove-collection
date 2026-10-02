import { execSync } from 'node:child_process'

/** Brings the test database up to the current migrations (replacing a leftover Laravel schema once). */
export default async function setup(): Promise<void> {
  const database = process.env.DB_TEST_DATABASE ?? 'mangrove_collection_test'
  if (!/test/i.test(database)) throw new Error(`Refusing to run tests against "${database}": the test database name must contain "test".`)

  process.env.DATABASE_URL = ''
  process.env.DB_DATABASE = database
  process.env.APP_ENV = 'testing'

  const { databaseUrl } = await import('../src/config/database-url.js')
  if (new URL(databaseUrl()).pathname !== `/${database}`) throw new Error('The test database URL does not point at the test database.')

  const { prisma } = await import('../src/lib/prisma.js')
  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'`

  if (tables.length > 0 && !tables.some((table) => table.name === '_prisma_migrations')) {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
    for (const { name } of tables) await prisma.$executeRawUnsafe(`DROP TABLE \`${name.replace(/`/g, '')}\``)
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
  }
  await prisma.$disconnect()

  execSync('pnpm exec prisma migrate deploy', { stdio: 'pipe', env: { ...process.env, DATABASE_URL: '', DB_DATABASE: database } })
}
