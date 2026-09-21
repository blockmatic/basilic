import { randomUUID } from 'node:crypto'
import { getDb } from '@repo/db'
import { users, walletIdentities } from '@repo/db/schema'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { eq } from 'drizzle-orm'
import * as nacl from 'tweetnacl'
import { beforeEach, describe, expect, it } from 'vitest'
import { getMagicLinkTokenRaw } from '../../../../../test/utils/auth-helper.js'
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

  async function seedLinkedSolana({ email }: { email: string }): Promise<void> {
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token: await getMagicLinkTokenRaw(fastify, email) },
    })
    const { token } = JSON.parse(verifyRes.body) as { token: string }
    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${token}` },
    })
    const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id
    const db = await getDb()
    await db.insert(walletIdentities).values({
      id: randomUUID(),
      userId,
      chain: 'solana',
      address,
    })
  }

  beforeEach(async () => {
    const db = await getDb()
    await db.delete(walletIdentities)
  })

  it('should verify valid SIWS signature and return JWTs', async () => {
    await seedLinkedSolana({ email: 'solana-linked@test.ai' })
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

  it('should return 401 WALLET_NOT_LINKED without creating a user', async () => {
    const db = await getDb()
    const beforeUsers = await db.select({ id: users.id }).from(users)
    const other = Keypair.generate()
    const otherAddress = other.publicKey.toBase58()
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: '/auth/web3/solana/nonce',
      query: { address: otherAddress },
    })
    const { nonce } = JSON.parse(nonceRes.body)
    const message = buildSiwsMessage({ domain: 'localhost', address: otherAddress, nonce })
    const signatureB58 = bs58.encode(
      nacl.sign.detached(new TextEncoder().encode(message), other.secretKey),
    )
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/solana/verify',
      payload: { message, signature: signatureB58, domain: 'localhost' },
    })
    expect(verifyRes.statusCode).toBe(401)
    expect(JSON.parse(verifyRes.body).code).toBe('WALLET_NOT_LINKED')
    const afterUsers = await db.select({ id: users.id }).from(users)
    expect(afterUsers).toHaveLength(beforeUsers.length)
    const wallets = await db
      .select()
      .from(walletIdentities)
      .where(eq(walletIdentities.address, otherAddress))
    expect(wallets).toHaveLength(0)
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
    await seedLinkedSolana({ email: 'solana-cb@test.ai' })
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
    await seedLinkedSolana({ email: 'solana-frag@test.ai' })
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
    await seedLinkedSolana({ email: 'solana-authed@test.ai' })
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
