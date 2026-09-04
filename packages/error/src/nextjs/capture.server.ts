import { logger } from '@repo/utils/logger/server'
import { createCaptureError } from '../core/capture-impl.js'
import type { CaptureErrorOptions } from '../types.js'

/** Next.js server/Route Handler capture. Default logger is the server logger. */
export const captureError: (options: CaptureErrorOptions) => void = createCaptureError(logger)
