import { describe, expect, it } from 'vitest'
import { getErrorMessage, isErrorWithMessage, toErrorWithMessage } from '../utils.js'

describe('utils', () => {
  describe('isErrorWithMessage', () => {
    it('should return true for Error instances', () => {
      expect(isErrorWithMessage(new Error('test'))).toBe(true)
    })

    it('should return true for objects with message property', () => {
      expect(isErrorWithMessage({ message: 'test' })).toBe(true)
    })

    it('should return false for null', () => {
      expect(isErrorWithMessage(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isErrorWithMessage(undefined)).toBe(false)
    })

    it('should return false for strings', () => {
      expect(isErrorWithMessage('test')).toBe(false)
    })

    it('should return false for numbers', () => {
      expect(isErrorWithMessage(123)).toBe(false)
    })

    it('should return false for objects without message', () => {
      expect(isErrorWithMessage({ code: 'ERROR' })).toBe(false)
    })

    it('should return false for objects with non-string message', () => {
      expect(isErrorWithMessage({ message: 123 })).toBe(false)
    })
  })

  describe('toErrorWithMessage', () => {
    it('should return Error instance as-is', () => {
      const error = new Error('test')
      expect(toErrorWithMessage(error)).toBe(error)
    })

    it('should return object with message as-is', () => {
      const error = { message: 'test' }
      expect(toErrorWithMessage(error)).toBe(error)
    })

    it('should convert string to Error', () => {
      const result = toErrorWithMessage('test')
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('test')
    })

    it('should convert number to Error', () => {
      const result = toErrorWithMessage(123)
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('123')
    })

    it('should convert null to Error', () => {
      const result = toErrorWithMessage(null)
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('null')
    })

    it('should convert undefined to Error', () => {
      const result = toErrorWithMessage(undefined)
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('undefined')
    })

    it('should convert object to Error', () => {
      const obj = { code: 'ERROR', data: { foo: 'bar' } }
      const result = toErrorWithMessage(obj)
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('[object Object]')
    })
  })

  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      expect(getErrorMessage(new Error('test'))).toBe('test')
    })

    it('should extract message from object with message', () => {
      expect(getErrorMessage({ message: 'test' })).toBe('test')
    })

    it('should convert string to message', () => {
      expect(getErrorMessage('test')).toBe('test')
    })

    it('should convert number to message', () => {
      expect(getErrorMessage(123)).toBe('123')
    })

    it('should handle null', () => {
      expect(getErrorMessage(null)).toBe('null')
    })

    it('should handle undefined', () => {
      expect(getErrorMessage(undefined)).toBe('undefined')
    })
  })
})
