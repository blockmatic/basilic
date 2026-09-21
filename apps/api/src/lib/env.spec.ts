import { describe, expect, it } from 'vitest'
import { parseAllowedOrigins } from './env.js'

describe('parseAllowedOrigins', () => {
  it('defaults to wildcard outside production', () => {
    expect(
      parseAllowedOrigins({
        raw: undefined,
        isProduction: false,
        webAppUrl: 'https://app.example.com',
      }),
    ).toEqual(['*'])
  })

  it('uses WEB_APP_URL origin when production omits ALLOWED_ORIGINS', () => {
    expect(
      parseAllowedOrigins({
        raw: undefined,
        isProduction: true,
        webAppUrl: 'https://app.example.com/dashboard',
      }),
    ).toEqual(['https://app.example.com'])
  })

  it('replaces production wildcard with WEB_APP_URL origin', () => {
    expect(
      parseAllowedOrigins({
        raw: '*',
        isProduction: true,
        webAppUrl: 'https://app.example.com',
      }),
    ).toEqual(['https://app.example.com'])
  })

  it('keeps an explicit production allowlist', () => {
    expect(
      parseAllowedOrigins({
        raw: 'https://app.example.com, https://preview.example.com',
        isProduction: true,
        webAppUrl: 'https://app.example.com',
      }),
    ).toEqual(['https://app.example.com', 'https://preview.example.com'])
  })
})
