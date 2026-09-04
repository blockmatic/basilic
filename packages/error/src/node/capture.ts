import { logger } from '@repo/utils/logger/server'
import { createCaptureError } from '../core/capture-impl.js'

/**
 * Captures errors by logging them. Pass `request.log` in Fastify for reqId.
 */
export const captureError = createCaptureError(logger)
