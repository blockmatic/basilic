import { privateKeyToAccount } from 'viem/accounts'
import { createSiweMessage } from 'viem/siwe'
import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

const TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)

describe('POST /account/link/wallet/verify', () => {
  beforeEach(async () => {
    const db = await (await import('../../../../db/index.js')).getDb()
    const { web3Nonce, walletIdentities } = await import('../../../../db/schema/index.js')
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
      },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return 401 for invalid signature', async () => {
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: await getMagicLinkToken() },
    })
    const { token } = JSON.parse(verifyRes.body)

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${TEST_ACCOUNT.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const message = createSiweMessage({
      address: TEST_ACCOUNT.address,
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
      },
    })
    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_SIGNATURE')
  })

  it('should link wallet on valid signature', async () => {
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: await getMagicLinkToken() },
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
      url: `/auth/web3/nonce?chain=eip155&address=${TEST_ACCOUNT.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: TEST_ACCOUNT.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await TEST_ACCOUNT.signMessage({ message: messageToSign })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        chain: 'eip155',
        message: messageToSign,
        signature,
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })

    const db = await (await import('../../../../db/index.js')).getDb()
    const { walletIdentities } = await import('../../../../db/schema/index.js')
    const { eq } = await import('drizzle-orm')
    const [row] = await db
      .select()
      .from(walletIdentities)
      .where(eq(walletIdentities.userId, userId))
    expect(row).toBeDefined()
    expect(row?.chain).toBe('eip155')
    expect(row?.address?.toLowerCase()).toBe(TEST_ACCOUNT.address.toLowerCase())
  })

  it('should link wallet when authenticated via API key', async () => {
    fastify.fakeEmail?.clear()
    const apiKey = await getApiKeyToken(fastify, 'wallet-verify-apikey@test.ai')
    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (userRes.statusCode !== 200) {
      throw new Error(`session/user failed: ${userRes.statusCode} ${userRes.body}`)
    }
    const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${TEST_ACCOUNT.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: TEST_ACCOUNT.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await TEST_ACCOUNT.signMessage({ message: messageToSign })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: {
        chain: 'eip155',
        message: messageToSign,
        signature,
      },
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ ok: true })

    const db = await (await import('../../../../db/index.js')).getDb()
    const { walletIdentities } = await import('../../../../db/schema/index.js')
    const { eq } = await import('drizzle-orm')
    const [row] = await db
      .select()
      .from(walletIdentities)
      .where(eq(walletIdentities.userId, userId))
    expect(row).toBeDefined()
    expect(row?.chain).toBe('eip155')
  })

  it('should return WALLET_ALREADY_LINKED when wallet belongs to another user', async () => {
    const token1 = await getMagicLinkToken()
    const verifyRes1 = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: token1 },
    })
    const { token: jwt1 } = JSON.parse(verifyRes1.body)

    const nonceRes = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${TEST_ACCOUNT.address}`,
    })
    const { nonce } = JSON.parse(nonceRes.body)

    const messageToSign = createSiweMessage({
      address: TEST_ACCOUNT.address,
      chainId: 1,
      domain: 'localhost',
      nonce,
      uri: 'https://localhost',
      version: '1',
    })
    const signature = await TEST_ACCOUNT.signMessage({ message: messageToSign })

    await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${jwt1}` },
      payload: { chain: 'eip155', message: messageToSign, signature },
    })

    const token2 = await getMagicLinkToken('other@test.ai')
    const verifyRes2 = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: token2 },
    })
    const { token: jwt2 } = JSON.parse(verifyRes2.body)

    const nonceRes2 = await fastify.inject({
      method: 'GET',
      url: `/auth/web3/nonce?chain=eip155&address=${TEST_ACCOUNT.address}`,
    })
    const { nonce: nonce2 } = JSON.parse(nonceRes2.body)

    const messageToSign2 = createSiweMessage({
      address: TEST_ACCOUNT.address,
      chainId: 1,
      domain: 'localhost',
      nonce: nonce2,
      uri: 'https://localhost',
      version: '1',
    })
    const signature2 = await TEST_ACCOUNT.signMessage({ message: messageToSign2 })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/wallet/verify',
      headers: { Authorization: `Bearer ${jwt2}` },
      payload: { chain: 'eip155', message: messageToSign2, signature: signature2 },
    })
    expect(response.statusCode).toBe(409)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('WALLET_ALREADY_LINKED')
  })
})

async function getMagicLinkToken(email = 'test@test.ai'): Promise<string> {
  await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: {
      email,
      callbackUrl: 'https://example.com/callback',
    },
  })
  const token = fastify.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  return token
}
