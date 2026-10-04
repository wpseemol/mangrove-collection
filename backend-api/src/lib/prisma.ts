import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client.js'
import { databaseUrl } from '../config/database-url.js'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

/**
 * MySQL 8's caching_sha2_password needs the server's RSA key for a full login (e.g. after a server
 * restart) on non-TLS connections. Fetching it is only safe on loopback, so elsewhere it is opt-in.
 */
function allowPublicKeyRetrieval(host: string): boolean {
  const flag = process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL
  return flag === undefined || flag === '' ? LOOPBACK_HOSTS.has(host) : flag === 'true' || flag === '1'
}

function createClient(): PrismaClient {
  const url = new URL(databaseUrl())

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? 10),
    timezone: '+00:00',
    allowPublicKeyRetrieval: allowPublicKeyRetrieval(url.hostname),
  })

  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type Db = typeof prisma
export type Tx = Parameters<Parameters<Db['$transaction']>[0]>[0]
