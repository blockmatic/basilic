import { describe, expect, it } from 'vitest'
import { negotiateOpenApiAccept } from './openapi-document.js'

describe('negotiateOpenApiAccept', () => {
  it('defaults missing Accept to json', () => {
    expect(negotiateOpenApiAccept({})).toBe('json')
    expect(negotiateOpenApiAccept({ acceptHeader: '' })).toBe('json')
  })

  it('returns json for HTML and wildcards', () => {
    expect(negotiateOpenApiAccept({ acceptHeader: 'text/html' })).toBe('json')
    expect(negotiateOpenApiAccept({ acceptHeader: '*/*' })).toBe('json')
  })

  it('returns openapi when Accept asks for application/openapi+json', () => {
    expect(negotiateOpenApiAccept({ acceptHeader: 'application/openapi+json' })).toBe('openapi')
  })

  it('picks the highest q among json-like types', () => {
    expect(
      negotiateOpenApiAccept({
        acceptHeader: 'application/json, application/openapi+json;q=0.8',
      }),
    ).toBe('json')
    expect(
      negotiateOpenApiAccept({
        acceptHeader: 'application/openapi+json, application/json;q=0.9',
      }),
    ).toBe('openapi')
  })
})
