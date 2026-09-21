import { describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { fastify } from './agents.spec.js'

describe('GET /agents', () => {
  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({ method: 'GET', url: '/agents' })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('lists command and chat with eve transport and absolute endpoints', async () => {
    const jwt = await getOrCreateSession(fastify, 'agents-list@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/agents',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as { id: string; transport: string; endpoint: string }[]
    expect(body.map(row => row.id).sort()).toEqual(['chat', 'command'])
    expect(body.every(row => row.transport === 'eve')).toBe(true)
    expect(body.every(row => /^https?:\/\//.test(row.endpoint))).toBe(true)
    expect(body.some(row => row.id === 'hello')).toBe(false)
  })
})
