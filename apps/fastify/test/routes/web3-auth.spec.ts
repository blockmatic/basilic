import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

// Temporarily disabled - web3 authentication tests skipped for now
describe.skip('Web3 Authentication', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  it('should return nonce for SIWE', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/sign-in/web3/eip155/nonce',
    })
    const body = JSON.parse(response.body)
    expect(response.statusCode).toBe(200)
    expect(body.nonce).toBeDefined()
    expect(body.chain).toBe('eip155')
  })

  it('should return nonce for Solana', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/sign-in/web3/solana/nonce',
    })
    const body = JSON.parse(response.body)
    expect(response.statusCode).toBe(200)
    expect(body.nonce).toBeDefined()
    expect(body.chain).toBe('solana')
  })
})
