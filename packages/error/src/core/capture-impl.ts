import type { Logger } from '@repo/utils/logger/types'
import { sanitizeLogData, toErrField } from '@repo/utils/logger/types'
import type { CaptureErrorOptions } from '../types.js'
import { toErrorWithMessage } from '../utils/index.js'

function toErr(error: unknown) {
  if (error instanceof Error) return toErrField(error)
  return toErrField(new Error(toErrorWithMessage(error).message))
}

/**
 * Creates a captureError function bound to a default logger.
 * Logs only — no reporting adapter.
 */
export function createCaptureError(defaultLogger: Logger) {
  return function captureError(options: CaptureErrorOptions): void {
    if (options.report === false) return

    const log = options.logger ?? defaultLogger
    const payload = {
      err: toErr(options.error),
      label: options.label,
      ...(options.code ? { code: options.code } : {}),
      ...(options.data ? sanitizeLogData(options.data) : {}),
      ...options.tags,
    }
    const msg = options.label
    if (options.level === 'warning') log.warn(payload, msg)
    else if (options.level === 'info') log.info(payload, msg)
    else log.error(payload, msg)
  }
}
