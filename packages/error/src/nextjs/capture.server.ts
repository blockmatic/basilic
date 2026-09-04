import { logger } from '@repo/utils/logger/server'
import { createCaptureError } from '../core/capture-impl.js'

/** Next.js server/Route Handler capture. Default logger is the server logger. */
export const captureError = createCaptureError(logger)
