import { describe, expect, it } from 'vitest'
import { fastify } from './web3.spec.js'

const validEthAddress = '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'
const validSolanaAddress = '4Cw1koUQtqybLFem7uqhzMBznMPGARbFS4cjaYbM9RnR'

describe('GET /auth/web3/nonce', () => {
  it('should return nonce for valid eip155 address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'eip155', address: validEthAddress },
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
      query: { chain: 'solana', address: validSolanaAddress },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
    expect(typeof body.nonce).toBe('string')
    expect(body.nonce.length).toBeGreaterThanOrEqual(8)
  })

  it('should return nonce for trimmed solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'solana', address: `  ${validSolanaAddress}  ` },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('nonce')
  })

  it('should return 400 for invalid chain', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'invalid', address: validEthAddress },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('BAD_REQUEST')
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
      query: { address: validEthAddress },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('BAD_REQUEST')
  })

  it('should return 400 for missing address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'eip155' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('BAD_REQUEST')
  })

  it('should reject empty solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce?chain=solana&address=',
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_ADDRESS')
  })

  it('should reject whitespace-only solana address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/nonce',
      query: { chain: 'solana', address: '   ' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_ADDRESS')
  })
})
