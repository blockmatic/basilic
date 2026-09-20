import type { FastifyRequest } from 'fastify'
import { describe, expect, it } from 'vitest'
import { env } from '../env.js'
import { getRequestOrigin } from './origin.js'

function requestStub({
  protocol,
  host,
  hostname = 'localhost',
}: {
  protocol: string
  host?: string
  hostname?: string
}): FastifyRequest {
  return { protocol, hostname, headers: { host } } as FastifyRequest
}

describe('getRequestOrigin', () => {
  it('builds origin from protocol and Host without a path or trailing slash', () => {
    const origin = getRequestOrigin({
      request: requestStub({ protocol: 'https', host: 'api.example.com' }),
    })
    expect(origin).toBe('https://api.example.com')
    expect(origin.endsWith('/')).toBe(false)
    expect(`${origin}/health`).toBe('https://api.example.com/health')
  })

  it('strips a trailing path from a malformed Host', () => {
    const origin = getRequestOrigin({
      request: requestStub({ protocol: 'https', host: 'api.example.com/v1' }),
    })
    expect(origin).toBe('https://api.example.com')
    expect(origin).not.toContain('//api.example.com/')
  })

  it('keeps a non-default port', () => {
    expect(
      getRequestOrigin({
        request: requestStub({ protocol: 'https', host: 'api.example.com:8443' }),
      }),
    ).toBe('https://api.example.com:8443')
  })

  it('falls back to hostname and PORT when Host is missing', () => {
    expect(
      getRequestOrigin({
        request: requestStub({ protocol: 'http', hostname: 'localhost' }),
      }),
    ).toBe(`http://localhost:${env.PORT}`)
  })
})
