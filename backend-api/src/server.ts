import './load-env.js'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { log } from './lib/log.js'
import { prisma } from './lib/prisma.js'

const config = env()
const app = createApp()

const server = app.listen(config.PORT, () => {
  log.info(`Mangrove Collection API listening on http://localhost:${config.PORT}`)
})

async function shutdown(signal: string): Promise<void> {
  log.info(`${signal} received, shutting down`)
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
