import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { paths } from './paths.js'

type Level = 'debug' | 'info' | 'warning' | 'error'
const ORDER: Record<Level, number> = { debug: 0, info: 1, warning: 2, error: 3 }

function threshold(): number {
  const level = (process.env.LOG_LEVEL ?? 'info') as Level
  return ORDER[level] ?? ORDER.info
}

function write(level: Level, message: string, context?: unknown): void {
  if (ORDER[level] < threshold() || process.env.LOG_SILENT === 'true') return

  const line = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}${context === undefined ? '' : ` ${formatContext(context)}`}`
  ;(level === 'error' ? console.error : console.log)(line)

  try {
    mkdirSync(dirname(paths.logFile), { recursive: true })
    appendFileSync(paths.logFile, `${line}\n`)
  } catch {
    // Logging must never break a request.
  }
}

function formatContext(context: unknown): string {
  if (context instanceof Error) return `${context.message}\n${context.stack ?? ''}`
  try {
    return JSON.stringify(context, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  } catch {
    return String(context)
  }
}

export const log = {
  debug: (message: string, context?: unknown) => write('debug', message, context),
  info: (message: string, context?: unknown) => write('info', message, context),
  warning: (message: string, context?: unknown) => write('warning', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
}

/** Logs an exception without interrupting the caller (Laravel's `report()`). */
export function report(error: unknown): void {
  log.error(error instanceof Error ? error.message : 'Unexpected error', error)
}
