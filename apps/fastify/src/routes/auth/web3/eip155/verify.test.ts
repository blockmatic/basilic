import { privateKeyToAccount } from 'viem/accounts'
import { createSiweMessage } from 'viem/siwe'
import { describe, expect, it } from 'vitest'
import { fastify } from '../../web3.spec.js'

const TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`
const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

describe('POST /auth/web3/eip155/verify', () => {
  it('should verify valid SIWE signature and return JWTs', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
      query: { address: TEST_ADDRESS },
    })
    expect(nonceRes.statusCode).toBe(200)
    const { nonce } = JSON.parse(nonceRes.body)

    const message = createSiweMessage({
      address: TEST_ADDRESS,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })

    const account = privateKeyToAccount(TEST_PRIVATE_KEY)
    const signature = await account.signMessage({ message })

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/eip155/verify',
      payload: { message, signature },
    })

    expect(verifyRes.statusCode).toBe(200)
    const body = JSON.parse(verifyRes.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
    expect(body.token.length).toBeGreaterThan(0)
  })

  it('should return 401 for invalid nonce', async () => {
    const message = createSiweMessage({
      address: TEST_ADDRESS,
      chainId: 1,
      domain: 'localhost',
      nonce: 'invalidnonce123',
      uri: 'https://localhost',
      version: '1',
    })

    const account = privateKeyToAccount(TEST_PRIVATE_KEY)
    const signature = await account.signMessage({ message })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/eip155/verify',
      payload: { message, signature },
    })

    expect(res.statusCode).toBe(401)
    const body = JSON.parse(res.body)
    expect(body.code).toBe('INVALID_NONCE')
  })

  it('should return 401 for invalid signature', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
      query: { address: TEST_ADDRESS },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = createSiweMessage({
      address: TEST_ADDRESS,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/eip155/verify',
      payload: { message, signature: '0xinvalid' },
    })

    expect(res.statusCode).toBe(401)
    const body = JSON.parse(res.body)
    expect(body.code).toBe('INVALID_SIGNATURE')
  })

  it('should access protected route after SIWE authentication', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/eip155/nonce',
      query: { address: TEST_ADDRESS },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = createSiweMessage({
      address: TEST_ADDRESS,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })

    const account = privateKeyToAccount(TEST_PRIVATE_KEY)
    const signature = await account.signMessage({ message })

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/eip155/verify',
      payload: { message, signature },
    })
    expect(verifyRes.statusCode).toBe(200)
    const { token } = JSON.parse(verifyRes.body)

    const authedRes = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(authedRes.statusCode).toBe(200)
    const authedBody = JSON.parse(authedRes.body)
    expect(authedBody.user.id).toBeTruthy()
  })
})
