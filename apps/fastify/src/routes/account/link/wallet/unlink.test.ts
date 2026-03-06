import { privateKeyToAccount } from 'viem/accounts'
import { createSiweMessage } from 'viem/siwe'
import { beforeEach, describe, expect, it } from 'vitest'
import { getApiKeyToken, getMagicLinkTokenRaw } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const testAccount = privateKeyToAccount(testPrivateKey as `0x${string}`)

async function linkWallet(jwt: string): Promise<string> {
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
  const signature = await testAccount.signMessage({ message })

  await fastify.inject({
    method: 'POST',
    url: '/account/link/wallet/verify',
    headers: { Authorization: `Bearer ${jwt}` },
    payload: { chain: 'eip155', message, signature },
  })

  const userRes = await fastify.inject({
    method: 'GET',
    url: '/auth/session/user',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  const { user } = JSON.parse(userRes.body)
  const linked = user.linkedWallets?.find((w: { chain: string }) => w.chain === 'eip155')
  if (!linked?.id) throw new Error('Wallet not linked')
  return linked.id
}

describe('DELETE /account/link/wallet/:id', () => {
  beforeEach(async () => {
    fastify.fakeEmail?.clear()
    const db = await (await import('../../../../db/index.js')).getDb()
    const { web3Nonce, walletIdentities } = await import('../../../../db/schema/index.js')
    await db.delete(walletIdentities)
    await db.delete(web3Nonce)
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/wallet/00000000-0000-0000-0000-000000000000',
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return 404 for non-existent wallet', async () => {
    const jwt = await (async () => {
      const token = await getMagicLinkTokenRaw(fastify)
      const verifyRes = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/verify',
        payload: { token },
      })
      return (JSON.parse(verifyRes.body) as { token: string }).token
    })()

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/account/link/wallet/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(404)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('NOT_FOUND')
  })

  it('should return 204 when unlink succeeds with JWT', async () => {
    const token = await getMagicLinkTokenRaw(fastify)
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token },
    })
    const jwt = (JSON.parse(verifyRes.body) as { token: string }).token

    const walletId = await linkWallet(jwt)

    const response = await fastify.inject({
      method: 'DELETE',
      url: `/account/link/wallet/${walletId}`,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(204)
  })

  it('should return 204 when unlink succeeds with API key', async () => {
    const apiKey = await getApiKeyToken(fastify, 'unlink-apikey@test.ai')
    const jwt = await (async () => {
      const token = await getMagicLinkTokenRaw(fastify, 'unlink-apikey@test.ai')
      const verifyRes = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/verify',
        payload: { token },
      })
      return (JSON.parse(verifyRes.body) as { token: string }).token
    })()

    const walletId = await linkWallet(jwt)

    const response = await fastify.inject({
      method: 'DELETE',
      url: `/account/link/wallet/${walletId}`,
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    expect(response.statusCode).toBe(204)
  })
})
