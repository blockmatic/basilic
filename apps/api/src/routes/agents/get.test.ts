import { describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { fastify } from './agents.spec.js'

describe('GET /agents/:agentId', () => {
  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({ method: 'GET', url: '/agents/command' })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('returns command metadata', async () => {
    const jwt = await getOrCreateSession(fastify, 'agents-get@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/agents/command',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id: 'command', transport: 'eve' })
  })

  it('returns 404 for unknown ids', async () => {
    const jwt = await getOrCreateSession(fastify, 'agents-get@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/agents/nope',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('NOT_FOUND')
  })
})
