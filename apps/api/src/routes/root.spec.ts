import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'
import { agentDiscoveryLinkHeader } from '../lib/agent/index.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

function visibleText({ html }: { html: string }): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')
}

describe('GET /', () => {
  let fastify: TestApp

  beforeAll(async () => {
    await setupGroupDatabase()
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    if (fastify) await fastify.close()
    await cleanupGroupDatabase()
  })

  it('should return HTML with status 200', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.headers.vary).toContain('Accept')
    expect(response.headers.link).toContain(agentDiscoveryLinkHeader)
    expect(response.body).toContain('Basilic Fastify API')
    expect(response.body).toContain('name="is-agentic-site-type" content="app"')
    expect(response.body).toContain('"@type":"WebAPI"')
    expect(response.body).toContain('/health')
    expect(response.body).toContain('/reference')
    expect(response.body).toContain('/openapi.json')
    expect(response.body).not.toContain('href="#"')
    expect(response.body.indexOf('<h1>')).toBeLessThan(response.body.indexOf('<h2>'))
    expect(
      visibleText({ html: response.body }).replace(/\s+/g, ' ').trim().length,
    ).toBeGreaterThanOrEqual(500)
  })

  it('should return markdown when Accept is text/markdown', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: { accept: 'text/markdown' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/markdown')
    expect(response.body).toContain('# Basilic Fastify API')
    expect(response.body).not.toContain('<!DOCTYPE html>')
  })

  it('should return 406 when Accept is only JSON', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: { accept: 'application/json' },
    })

    expect(response.statusCode).toBe(406)
    expect(response.headers.vary).toContain('Accept')
  })

  it('should return HTML 404 recovery for unknown paths', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/this-path-does-not-exist-a1',
    })

    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.body).toContain('href="/"')
  })

  it('should return catalog JSON 404 for unknown paths that prefer JSON', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/this-path-does-not-exist-a1',
      headers: { accept: 'application/json' },
    })

    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toMatchObject({ code: 'NOT_FOUND' })
  })
})
