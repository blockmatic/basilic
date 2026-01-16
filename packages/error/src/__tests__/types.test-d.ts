import type { mapHttpStatusToErrorCode } from '../mappers.js'
import type { CaptureErrorOptions, CoreErrorCode } from '../types.js'

// Type tests using TypeScript's type system
// These tests verify type safety at compile time
// If any of these assertions fail, TypeScript will report a type error

// Test 1: CoreErrorCode includes all expected core error codes
type TestServerCodes =
  | 'SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'

type TestClientCodes =
  | 'CLIENT_VALIDATION_ERROR'
  | 'CLIENT_FORMAT_ERROR'
  | 'NETWORK_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'FETCH_ERROR'

type TestCommonCodes = 'UNEXPECTED_ERROR'

type TestAllCoreCodes = TestServerCodes | TestClientCodes | TestCommonCodes

// Verify all test codes are assignable to CoreErrorCode
// These will error if CoreErrorCode doesn't include these codes
const _assert1: CoreErrorCode = 'SERVER_ERROR'
const _assert2: CoreErrorCode = 'BAD_REQUEST'
const _assert3: CoreErrorCode = 'NETWORK_ERROR'
const _assert4: CoreErrorCode = 'UNEXPECTED_ERROR'

// Verify CoreErrorCode includes all test codes (this will error if any are missing)
const _assert5: CoreErrorCode = '' as TestAllCoreCodes

// Test 2: mapHttpStatusToErrorCode returns CoreErrorCode
const _assert6: CoreErrorCode = '' as ReturnType<typeof mapHttpStatusToErrorCode>

// Test 3: CaptureErrorOptions.code accepts CoreErrorCode and string
const _assert7: CaptureErrorOptions['code'] = 'SERVER_ERROR'
const _assert8: CaptureErrorOptions['code'] = 'BAD_REQUEST'
const _assert9: CaptureErrorOptions['code'] = 'NETWORK_ERROR'
const _assert10: CaptureErrorOptions['code'] = 'UNEXPECTED_ERROR'
const _assert11: CaptureErrorOptions['code'] = 'CUSTOM_APP_ERROR'

// Test 4: CaptureErrorOptions.tags.app accepts known apps and string
const _assert12: NonNullable<CaptureErrorOptions['tags']>['app'] = 'api'
const _assert13: NonNullable<CaptureErrorOptions['tags']>['app'] = 'web'
const _assert14: NonNullable<CaptureErrorOptions['tags']>['app'] = 'mobile'
const _assert15: NonNullable<CaptureErrorOptions['tags']>['app'] = 'docs'
const _assert16: NonNullable<CaptureErrorOptions['tags']>['app'] = 'custom-app'

// Suppress unused variable warnings - these are type assertions
void _assert1
void _assert2
void _assert3
void _assert4
void _assert5
void _assert6
void _assert7
void _assert8
void _assert9
void _assert10
void _assert11
void _assert12
void _assert13
void _assert14
void _assert15
void _assert16
