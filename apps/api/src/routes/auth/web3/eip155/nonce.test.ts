import { describe, expect, it } from 'vitest'
import { fastify } from '../../web3.spec.js'

describe('GET /auth/web3/eip155/nonce', () => {
  it('should return nonce for valid Ethereum address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
      query: { address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e' },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
    expect(typeof body.nonce).toBe('string')
    expect(body.nonce.length).toBeGreaterThanOrEqual(8)
  })

  it('should return 400 for invalid Ethereum address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
      query: { address: 'not-an-address' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_ADDRESS')
  })

  it('should return 400 for missing address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
    })

    expect(response.statusCode).toBe(400)
  })
})
