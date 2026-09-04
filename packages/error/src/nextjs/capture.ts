import { logger } from '@repo/utils/logger/client'
import { createCaptureError } from '../core/capture-impl.js'

/** Next.js client capture. Default logger is the browser logger. */
export const captureError = createCaptureError(logger)
