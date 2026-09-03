import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import * as nacl from 'tweetnacl'
import { describe, expect, it } from 'vitest'
import { fastify } from '../web3.spec.js'

function buildSiwsMessage({
  domain,
  address,
  nonce,
  uri = 'https://localhost',
}: {
  domain: string
  address: string
  nonce: string
  uri?: string
}) {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\nSign in to the application\n\nURI: ${uri}\nVersion: 1\nChain ID: mainnet-beta\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
}

describe('POST /auth/web3/solana/verify', () => {
  const keypair = Keypair.generate()
  const address = keypair.publicKey.toBase58()

  it('should verify valid SIWS signature and return JWTs', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    expect(nonceRes.statusCode).toBe(200)
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })

    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, domain: 'localhost' },
    })

    expect(verifyRes.statusCode).toBe(200)
    const body = JSON.parse(verifyRes.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
    expect(body.token.length).toBeGreaterThan(0)
  })

  it('should return 401 for invalid nonce', async () => {
    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce: 'invalid-nonce-12345678',
    })

    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, domain: 'localhost' },
    })

    expect(res.statusCode).toBe(401)
    const body = JSON.parse(res.body)
    expect(body.code).toBe('INVALID_NONCE')
  })

  it('should return 401 for invalid signature', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: bs58.encode(new Uint8Array(64).fill(0)), domain: 'localhost' },
    })

    expect(res.statusCode).toBe(401)
    const body = JSON.parse(res.body)
    expect(body.code).toBe('INVALID_SIGNATURE')
  })

  it('should return 400 for invalid callbackUrl', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })
    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: {
        message,
        signature: signatureB58,
        callbackUrl: 'javascript:alert(1)',
        domain: 'localhost',
      },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('INVALID_CALLBACK_URL')
  })

  it('should return 302 with encoded code when callbackUrl provided', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })
    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)
    const callbackUrl = 'https://example.com/auth/callback'

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, callbackUrl, domain: 'localhost' },
    })

    expect(verifyRes.statusCode).toBe(302)
    const location = verifyRes.headers.location
    expect(location).toBeDefined()
    expect(location).toMatch(/^https:\/\/example\.com\/auth\/callback[?&]code=/)
    const codeMatch = location?.match(/[?&]code=([^&]+)/)
    expect(codeMatch?.[1]).toBeTruthy()
  })

  it('should place code in query string when callbackUrl has fragment', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })
    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)
    const callbackUrl = 'https://example.com/auth/callback#section'

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, callbackUrl, domain: 'localhost' },
    })

    expect(verifyRes.statusCode).toBe(302)
    const location = verifyRes.headers.location
    expect(location).toBeDefined()
    const parsed = new URL(location ?? '')
    expect(parsed.searchParams.get('code')).toBeTruthy()
    expect(parsed.hash).toBe('#section')
  })

  it('should access protected route after SIWS authentication', async () => {
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address },
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = buildSiwsMessage({
      domain: 'localhost',
      address,
      nonce,
    })
    const messageBytes = new TextEncoder().encode(message)
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const signatureB58 = bs58.encode(signature)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, domain: 'localhost' },
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
