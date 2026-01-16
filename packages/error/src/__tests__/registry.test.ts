import { describe, expect, it } from 'vitest'
import { getError } from '../registry.js'

describe('registry', () => {
  describe('getError', () => {
    it('should return core server errors', () => {
      expect(getError('SERVER_ERROR')).toEqual({
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred',
      })
      expect(getError('BAD_REQUEST')).toEqual({
        code: 'BAD_REQUEST',
        message: 'Invalid request',
      })
      expect(getError('NOT_FOUND')).toEqual({
        code: 'NOT_FOUND',
        message: 'Resource not found',
      })
    })

    it('should return core client errors', () => {
      expect(getError('NETWORK_ERROR')).toEqual({
        code: 'NETWORK_ERROR',
        message: 'A network error occurred',
      })
      expect(getError('FETCH_ERROR')).toEqual({
        code: 'FETCH_ERROR',
        message: 'Failed to fetch resource',
      })
    })

    it('should return common errors', () => {
      expect(getError('UNEXPECTED_ERROR')).toEqual({
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
      })
    })

    it('should return API-specific errors', () => {
      expect(getError('AI_MODEL_ERROR')).toEqual({
        code: 'AI_MODEL_ERROR',
        message: 'AI model error occurred',
      })
      expect(getError('BLOCKCHAIN_TRX_OP_FAILURE')).toEqual({
        code: 'BLOCKCHAIN_TRX_OP_FAILURE',
        message: 'Blockchain transaction operation failed',
      })
    })

    it('should return web-specific errors', () => {
      expect(getError('DASHBOARD_DATA_LOAD_FAILED')).toEqual({
        code: 'DASHBOARD_DATA_LOAD_FAILED',
        message: 'Failed to load dashboard data',
      })
    })

    it('should return undefined for error code not in catalog', () => {
      expect(getError('UNREGISTERED_ERROR')).toBeUndefined()
    })
  })
})
