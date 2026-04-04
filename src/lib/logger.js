/**
 * Centralized error logging utility.
 *
 * Development mode: writes to console.error / console.warn.
 * Production mode: calls pluggable transport function.
 * Default transport: console (no-op upgrade path).
 *
 * Requirements: 13.1, 13.2, 13.3
 */

const isDev = import.meta.env.MODE === 'development'

let transport = null

/**
 * Register a custom transport for production error reporting.
 * @param {(level: string, message: string, context?: object) => void} fn
 */
export function setTransport(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Transport must be a function')
  }
  transport = fn
}

/**
 * Log an error through the centralized logging pipeline.
 * @param {Error|string} error
 * @param {object} [context]
 */
export function logError(error, context) {
  const message = error instanceof Error ? error.message : String(error)

  if (transport) {
    transport('error', message, context)
    return
  }

  if (isDev) {
    console.error('[Logger]', message, context ?? '')
  }
}

/**
 * Log a warning through the centralized logging pipeline.
 * @param {string} message
 * @param {object} [context]
 */
export function logWarn(message, context) {
  if (transport) {
    transport('warn', message, context)
    return
  }

  if (isDev) {
    console.warn('[Logger]', message, context ?? '')
  }
}
