import { describe, expect, it } from 'vitest'
import { fastify } from '../web3.spec.js'

const VALID_ETH_ADDRESS = '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'
const VALID_SOLANA_ADDRESS = '4Cw1koUQtqybLFem7uqhzMBznMPGARbFS4cjaYbM9RnR'

describe('GET /auth/web3/nonce', () => {
  it('should return nonce for valid eip155 address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'eip155', address: VALID_ETH_ADDRESS },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
    expect(typeof body.nonce).toBe('string')
    expect(body.nonce.length).toBeGreaterThanOrEqual(8)
  })

  it('should return nonce for valid solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'solana', address: VALID_SOLANA_ADDRESS },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
    expect(typeof body.nonce).toBe('string')
    expect(body.nonce.length).toBeGreaterThanOrEqual(8)
  })

  it('should return 400 for invalid chain', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'invalid', address: VALID_ETH_ADDRESS },
    })

    expect(response.statusCode).toBe(400)
    // Fastify schema validation returns BAD_REQUEST; handler returns INVALID_CHAIN for invalid chain value
    const body = JSON.parse(response.body)
    expect(['BAD_REQUEST', 'INVALID_CHAIN']).toContain(body.code)
  })

  it('should return 400 for invalid eip155 address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'eip155', address: 'not-an-address' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_ADDRESS')
  })

  it('should return 400 for missing chain', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { address: VALID_ETH_ADDRESS },
    })

    expect(response.statusCode).toBe(400)
    // Schema validation may return BAD_REQUEST before handler runs
    const body = JSON.parse(response.body)
    expect(['BAD_REQUEST', 'MISSING_PARAMS']).toContain(body.code)
  })

  it('should return 400 for missing address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'eip155' },
    })

    expect(response.statusCode).toBe(400)
    // Schema validation may return BAD_REQUEST before handler runs
    const body = JSON.parse(response.body)
    expect(['BAD_REQUEST', 'MISSING_PARAMS']).toContain(body.code)
  })
})
