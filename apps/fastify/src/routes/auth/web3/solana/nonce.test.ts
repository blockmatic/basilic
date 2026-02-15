import { describe, expect, it } from 'vitest'
import { fastify } from '../../web3.spec.js'

const VALID_SOLANA_ADDRESS = '4Cw1koUQtqybLFem7uqhzMBznMPGARbFS4cjaYbM9RnR'

describe('GET /auth/web3/solana/nonce', () => {
  it('should return nonce for valid Solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address: VALID_SOLANA_ADDRESS },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
    expect(typeof body.nonce).toBe('string')
    expect(body.nonce.length).toBeGreaterThanOrEqual(8)
  })

  it('should return 400 for invalid Solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address: 'not-a-solana-address' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_ADDRESS')
  })

  it('should return 400 for missing address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
    })

    expect(response.statusCode).toBe(400)
  })
})
