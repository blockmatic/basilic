import { privateKeyToAccount } from 'viem/accounts'
import { createSiweMessage } from 'viem/siwe'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getApiKeyToken,
  getMagicLinkTokenRaw,
  getWeb3Session,
} from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const testAccount = privateKeyToAccount(testPrivateKey as `0x${string}`)

describe('POST /account/link/wallet/verify', () => {
  beforeEach(async () => {
    const db = await (await import('@repo/db')).getDb()
    const { web3Nonce, walletIdentities } = await import('@repo/db/schema')
    await db.delete(walletIdentities)
    await db.delete(web3Nonce)
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      payload: {
        chain: 'eip155',
        message: 'test message',
        signature: '0x00',
        domain: 'localhost',
      },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return 401 for invalid signature', async () => {
    const email = 'test@test.ai'
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token: await getMagicLinkTokenRaw(fastify) },
    })
    const { token } = JSON.parse(verifyRes.body)

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        chain: 'eip155',
        message,
        signature: '0xinvalid',
        domain: 'localhost',
      },
    })
    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_SIGNATURE')
  })

  it('should link wallet on valid signature', async () => {
    const email = 'test@test.ai'
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token: await getMagicLinkTokenRaw(fastify) },
    })
    const { token } = JSON.parse(verifyRes.body)
    const userId = JSON.parse(
      (
        await fastify.inject({
          method: 'GET',
          url: '/auth/session/user',
          headers: { Authorization: `Bearer ${token}` },
        })
      ).body,
    ).user.id

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await testAccount.signMessage({ message: messageToSign })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        chain: 'eip155',
        message: messageToSign,
        signature,
        domain: 'localhost',
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })

    const db = await (await import('@repo/db')).getDb()
    const { walletIdentities } = await import('@repo/db/schema')
    const { eq } = await import('drizzle-orm')
    const [row] = await db
      .select()
      .from(walletIdentities)
      .where(eq(walletIdentities.userId, userId))
    expect(row).toBeDefined()
    expect(row?.chain).toBe('eip155')
    expect(row?.address?.toLowerCase()).toBe(testAccount.address.toLowerCase())
  })

  it('should link wallet when authenticated via API key', async () => {
    fastify.fakeEmail?.clear()
    const apiKey = await getApiKeyToken(fastify, 'wallet-verify-apikey@test.ai')
    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (userRes.statusCode !== 200)
      throw new Error(`session/user failed: ${userRes.statusCode} ${userRes.body}`)

    const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await testAccount.signMessage({ message: messageToSign })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: {
        chain: 'eip155',
        message: messageToSign,
        signature,
        domain: 'localhost',
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })

    const db = await (await import('@repo/db')).getDb()
    const { walletIdentities } = await import('@repo/db/schema')
    const { eq } = await import('drizzle-orm')
    const [row] = await db
      .select()
      .from(walletIdentities)
      .where(eq(walletIdentities.userId, userId))
    expect(row).toBeDefined()
    expect(row?.chain).toBe('eip155')
  })

  it('should return WALLET_ALREADY_LINKED when wallet belongs to another user', async () => {
    const email1 = 'test@test.ai'
    const token1 = await getMagicLinkTokenRaw(fastify)
    const verifyRes1 = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email: email1, token: token1 },
    })
    const { token: jwt1 } = JSON.parse(verifyRes1.body)

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await testAccount.signMessage({ message: messageToSign })

    await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${jwt1}` },
      payload: { chain: 'eip155', message: messageToSign, signature, domain: 'localhost' },
    })

    const email2 = 'other@test.ai'
    const token2 = await getMagicLinkTokenRaw(fastify, email2)
    const verifyRes2 = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email: email2, token: token2 },
    })
    const { token: jwt2 } = JSON.parse(verifyRes2.body)

    const nonceRes2 = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce: nonce2 } = JSON.parse(nonceRes2.body)

    const messageToSign2 = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce: nonce2,
      uri: 'https://localhost',
      version: '1',
    })
    const signature2 = await testAccount.signMessage({ message: messageToSign2 })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${jwt2}` },
      payload: {
        chain: 'eip155',
        message: messageToSign2,
        signature: signature2,
        domain: 'localhost',
      },
    })
    expect(response.statusCode).toBe(409)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('WALLET_ALREADY_LINKED')
  })

  it('should return INVALID_DOMAIN when domain is not allowed', async () => {
    const email = 'domain-link@test.ai'
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token: await getMagicLinkTokenRaw(fastify, email) },
    })
    const { token } = JSON.parse(verifyRes.body)

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${testAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)
    const message = createSiweMessage({
      address: testAccount.address,
      chainId: 1,
      domain: 'evil.example',
      nonce,
      uri: 'https://evil.example',
      version: '1',
    })
    const signature = await testAccount.signMessage({ message })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: { chain: 'eip155', message, signature, domain: 'evil.example' },
    })
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).code).toBe('INVALID_DOMAIN')
  })

  it('should return EMAIL_REQUIRED when the account has no email', async () => {
    const jwt = await getWeb3Session(fastify, { accountIndex: 1 })
    const otherAccount = privateKeyToAccount(
      '0x5de4111afa1a4b94908e83a8ec860c567f04b3aa191f021b7f36795a0579779b',
    )
    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${otherAccount.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)
    const message = createSiweMessage({
      address: otherAccount.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await otherAccount.signMessage({ message })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { chain: 'eip155', message, signature, domain: 'localhost' },
    })
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).code).toBe('EMAIL_REQUIRED')
  })
})
