import { describe, expect, it } from 'vitest'
import { mapHttpStatusToErrorCode } from '../mappers.js'

describe('mappers', () => {
  describe('mapHttpStatusToErrorCode', () => {
    describe('4xx Client Errors', () => {
      it('should map 400 to BAD_REQUEST', () => {
        expect(mapHttpStatusToErrorCode(400)).toBe('BAD_REQUEST')
      })

      it('should map 401 to UNAUTHORIZED', () => {
        expect(mapHttpStatusToErrorCode(401)).toBe('UNAUTHORIZED')
      })

      it('should map 403 to FORBIDDEN', () => {
        expect(mapHttpStatusToErrorCode(403)).toBe('FORBIDDEN')
      })

      it('should map 404 to NOT_FOUND', () => {
        expect(mapHttpStatusToErrorCode(404)).toBe('NOT_FOUND')
      })

      it('should map 409 to CONFLICT', () => {
        expect(mapHttpStatusToErrorCode(409)).toBe('CONFLICT')
      })

      it('should map 422 to INVALID_INPUT', () => {
        expect(mapHttpStatusToErrorCode(422)).toBe('INVALID_INPUT')
      })

      it('should map 429 to RATE_LIMIT_EXCEEDED', () => {
        expect(mapHttpStatusToErrorCode(429)).toBe('RATE_LIMIT_EXCEEDED')
      })

      it('should fallback unmapped 4xx to BAD_REQUEST', () => {
        expect(mapHttpStatusToErrorCode(418)).toBe('BAD_REQUEST') // I'm a teapot
        expect(mapHttpStatusToErrorCode(451)).toBe('BAD_REQUEST') // Unavailable For Legal Reasons
      })
    })

    describe('5xx Server Errors', () => {
      it('should map 500 to SERVER_ERROR', () => {
        expect(mapHttpStatusToErrorCode(500)).toBe('SERVER_ERROR')
      })

      it('should map 502 to BAD_GATEWAY', () => {
        expect(mapHttpStatusToErrorCode(502)).toBe('BAD_GATEWAY')
      })

      it('should map 503 to SERVICE_UNAVAILABLE', () => {
        expect(mapHttpStatusToErrorCode(503)).toBe('SERVICE_UNAVAILABLE')
      })

      it('should map 504 to GATEWAY_TIMEOUT', () => {
        expect(mapHttpStatusToErrorCode(504)).toBe('GATEWAY_TIMEOUT')
      })

      it('should fallback unmapped 5xx to SERVER_ERROR', () => {
        expect(mapHttpStatusToErrorCode(507)).toBe('SERVER_ERROR')
        expect(mapHttpStatusToErrorCode(508)).toBe('SERVER_ERROR')
      })
    })

    describe('Edge Cases', () => {
      it('should return SERVER_ERROR for undefined', () => {
        expect(mapHttpStatusToErrorCode(undefined)).toBe('SERVER_ERROR')
      })

      it('should return UNEXPECTED_ERROR for 2xx', () => {
        expect(mapHttpStatusToErrorCode(200)).toBe('UNEXPECTED_ERROR')
        expect(mapHttpStatusToErrorCode(201)).toBe('UNEXPECTED_ERROR')
      })

      it('should return UNEXPECTED_ERROR for 3xx', () => {
        expect(mapHttpStatusToErrorCode(301)).toBe('UNEXPECTED_ERROR')
        expect(mapHttpStatusToErrorCode(302)).toBe('UNEXPECTED_ERROR')
      })

      it('should return UNEXPECTED_ERROR for invalid codes', () => {
        expect(mapHttpStatusToErrorCode(999)).toBe('UNEXPECTED_ERROR')
        expect(mapHttpStatusToErrorCode(-1)).toBe('UNEXPECTED_ERROR')
      })
    })
  })
})
