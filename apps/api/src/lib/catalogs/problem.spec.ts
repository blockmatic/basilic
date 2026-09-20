import { describe, expect, it } from 'vitest'
import { env } from '../env.js'
import { formatIetfRateLimitHeaders, preferProblemJson, toCatalogProblem } from './problem.js'

describe('preferProblemJson', () => {
  it('is false when Accept is missing or json only', () => {
    expect(preferProblemJson({})).toBe(false)
    expect(preferProblemJson({ acceptHeader: 'application/json' })).toBe(false)
    expect(preferProblemJson({ acceptHeader: 'text/html' })).toBe(false)
  })

  it('is true when problem+json is present and json is absent', () => {
    expect(preferProblemJson({ acceptHeader: 'application/problem+json' })).toBe(true)
  })

  it('prefers problem+json when q is greater or equal', () => {
    expect(
      preferProblemJson({
        acceptHeader: 'application/json, application/problem+json',
      }),
    ).toBe(true)
    expect(
      preferProblemJson({
        acceptHeader: 'application/problem+json;q=0.8, application/json;q=0.8',
      }),
    ).toBe(true)
  })

  it('is false when application/json has a higher q', () => {
    expect(
      preferProblemJson({
        acceptHeader: 'application/json, application/problem+json;q=0.5',
      }),
    ).toBe(false)
  })
})

describe('toCatalogProblem', () => {
  it('adds RFC 9457 fields and keeps code and message', () => {
    const docs = env.DOCS_SITE_URL.endsWith('/')
      ? env.DOCS_SITE_URL.slice(0, -1)
      : env.DOCS_SITE_URL
    expect(
      toCatalogProblem({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        status: 401,
      }),
    ).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      type: `${docs}/docs/architecture/error-handling#UNAUTHORIZED`,
      title: 'Authentication required',
      status: 401,
      detail: 'Authentication required',
    })
  })

  it('uses an explicit detail when provided', () => {
    expect(
      toCatalogProblem({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        status: 429,
        detail: 'Rate limit exceeded. Maximum 1 requests per 60s',
      }).detail,
    ).toBe('Rate limit exceeded. Maximum 1 requests per 60s')
  })
})

describe('formatIetfRateLimitHeaders', () => {
  it('emits structured RateLimit fields', () => {
    expect(
      formatIetfRateLimitHeaders({
        max: 10,
        remaining: 0,
        resetSeconds: 45,
        windowSeconds: 60,
      }),
    ).toEqual({
      rateLimitPolicy: '"default";q=10;w=60',
      rateLimit: '"default";r=0;t=45',
      retryAfter: '45',
    })
  })
})
