import { createSiweMessage } from 'viem/siwe'
import type { Web3Chain } from '@/wallet/types'
import { buildSiwsMessage } from './web3-sign-utils'

export type Web3SignParams = {
  chain: Web3Chain
  address: string
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
  nonce: string
  domain: string
  statement: string
  uri: string
  chainId: number
  network: string
}

export async function buildAndSignMessage({
  chain,
  address,
  signMessage,
  nonce,
  domain,
  statement,
  uri,
  chainId,
  network,
}: Web3SignParams): Promise<{ message: string; signature: string }> {
  const message =
    chain === 'eip155'
      ? createSiweMessage({
          address: address as `0x${string}`,
          chainId,
          domain,
          nonce,
          uri,
          version: '1',
          statement,
        })
      : buildSiwsMessage({
          domain,
          address,
          nonce,
          statement,
          uri,
          chainId: network,
        })
  const result = await signMessage(message)
  return { message, signature: result.signature }
}
