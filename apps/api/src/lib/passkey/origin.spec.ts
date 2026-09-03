import { describe, expect, it } from 'vitest'
import { isAllowedCallbackOriginScheme } from './origin.js'

describe('isAllowedCallbackOriginScheme', () => {
  it('allows https origins', () =>
    expect(
      isAllowedCallbackOriginScheme({
        origin: 'https://example.com',
        nodeEnv: 'production',
      }),
    ).toBe(true))

  it('allows http loopback in non-production', () =>
    expect(
      isAllowedCallbackOriginScheme({
        origin: 'http://localhost:3000',
        nodeEnv: 'test',
      }),
    ).toBe(true))

  it('rejects non-loopback http', () =>
    expect(
      isAllowedCallbackOriginScheme({
        origin: 'http://example.com',
        nodeEnv: 'test',
      }),
    ).toBe(false))

  it('rejects http loopback in production', () =>
    expect(
      isAllowedCallbackOriginScheme({
        origin: 'http://localhost:3000',
        nodeEnv: 'production',
      }),
    ).toBe(false))

  it('rejects unparseable origins', () =>
    expect(
      isAllowedCallbackOriginScheme({
        origin: 'not-a-url',
        nodeEnv: 'test',
      }),
    ).toBe(false))
})
