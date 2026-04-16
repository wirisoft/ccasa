/**
 * Lightweight structured logger for ccasa-frontend.
 * Provides namespaced, leveled logging with dev console output and
 * a production in-memory circular buffer (last 200 entries).
 *
 * @module logger
 * @dependencies none
 * @example
 *   const log = createLogger('ConductivityPanel')
 *   log.info('Record saved', { id: 42 })
 *   log.error('Sync failed', err)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  meta?: unknown
}

export interface Logger {
  debug(message: string, meta?: unknown): void
  info(message: string, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  error(message: string, meta?: unknown): void
}

const COLORS: Record<LogLevel, string> = {
  debug: 'color: gray',
  info: 'color: #1976d2',
  warn: 'color: #ed6c02',
  error: 'color: #d32f2f',
}

const MAX_BUFFER_SIZE = 200
const logBuffer: LogEntry[] = []

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry)
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift()
  }
}

/**
 * Returns a copy of the in-memory log buffer (production only).
 * Useful for exporting diagnostics without a DevTools console.
 */
export function getLogBuffer(): LogEntry[] {
  return [...logBuffer]
}

/** Clears the in-memory log buffer. */
export function clearLogBuffer(): void {
  logBuffer.length = 0
}

/**
 * Creates a namespaced logger for the given module.
 *
 * Development: colored prefixed output to the browser console.
 * Production:  silent — entries accumulate in an in-memory circular buffer.
 */
export function createLogger(module: string): Logger {
  const isDev = process.env.NODE_ENV !== 'production'

  function log(level: LogLevel, message: string, meta?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...(meta !== undefined ? { meta } : {}),
    }

    if (!isDev) {
      addToBuffer(entry)
      return
    }

    const prefix = `[${level.toUpperCase().padEnd(5)}] [${module}]`
    const style = COLORS[level]

    if (meta !== undefined) {
      // Logger is the one place where console output is intentional
      // eslint-disable-next-line no-console
      console.log(`%c${prefix} ${message}`, style, meta)
    } else {
      // eslint-disable-next-line no-console
      console.log(`%c${prefix} ${message}`, style)
    }
  }

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
  }
}
