import { logger } from '@repo/utils/logger/client'
import { createCaptureError } from '../core/capture-impl.js'

export const captureError = createCaptureError(logger)
