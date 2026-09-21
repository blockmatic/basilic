'use client'

import { useReactApiConfig, useVerifyLinkWallet, useVerifyWeb3Auth } from '@repo/react'
import { getWallets } from '@wallet-standard/app'
import type { Wallet } from '@wallet-standard/base'
import { useLocalStorageState } from 'ahooks'
import bs58 from 'bs58'
import { useEffect, useState } from 'react'
import { getAddress } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import { ConnectorAlreadyConnectedError, useConnect, useConnectors, useSignMessage } from 'wagmi'
import {
  catalogWallets,
  type DetectedWallet,
  hasWalletConnectProjectId,
  mergeWalletRows,
  searchWalletRows,
  sortWalletRows,
  type WalletRow,
} from '@/lib/wallet'

type AuthMode = 'login' | 'link'

function isSolanaWallet(wallet: Wallet): boolean {
  return wallet.chains.some(chain => chain.startsWith('solana:'))
}

function buildSiwsMessage({
  domain,
  address,
  nonce,
  uri,
}: {
  domain: string
  address: string
  nonce: string
  uri: string
}): string {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\nSign in to Basilic\n\nURI: ${uri}\nVersion: 1\nChain ID: mainnet-beta\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
}

export function useWalletAuth({ mode }: { mode: AuthMode }) {
  const { client } = useReactApiConfig()
  const connectors = useConnectors()
  const { connectAsync } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const verifyLogin = useVerifyWeb3Auth()
  const verifyLink = useVerifyLinkWallet()
  const [standardWallets, setStandardWallets] = useState<Wallet[]>([])
  const [recentIds, setRecentIds] = useLocalStorageState<string[]>('basilic.wallet.recent', {
    defaultValue: [],
  })
  const [query, setQuery] = useState('')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const api = getWallets()
    const sync = () => setStandardWallets(api.get().filter(isSolanaWallet))
    sync()
    const offRegister = api.on('register', sync)
    const offUnregister = api.on('unregister', sync)
    return () => {
      offRegister()
      offUnregister()
    }
  }, [])

  const detected: DetectedWallet[] = [
    ...connectors
      .filter(connector => connector.type === 'injected')
      .map(connector => ({
        id: connector.id,
        name: connector.name,
        namespaces: ['eip155' as const],
        rdns: connector.id.includes('.') ? connector.id : undefined,
        connectKind: 'injected' as const,
      })),
    ...standardWallets.map(wallet => ({
      id: wallet.name.toLowerCase().replace(/\s+/g, '-'),
      name: wallet.name,
      namespaces: ['solana' as const],
      rdns: wallet.name.toLowerCase().includes('phantom')
        ? 'app.phantom'
        : wallet.name.toLowerCase().includes('backpack')
          ? 'app.backpack'
          : wallet.name.toLowerCase().includes('solflare')
            ? 'app.solflare'
            : undefined,
      connectKind: 'standard' as const,
    })),
  ]

  const rows = searchWalletRows({
    rows: sortWalletRows(
      mergeWalletRows({
        catalog: catalogWallets,
        detected,
        recentIds: recentIds ?? [],
        hasWalletConnectProjectId,
      }),
    ),
    query,
  })

  async function authenticate({ row }: { row: WalletRow }): Promise<void> {
    setIsPending(true)
    try {
      const domain = window.location.host
      const origin = window.location.origin
      const signed = row.namespaces.includes('eip155')
        ? await signEip155({ row, domain, origin })
        : await signSolana({ row, domain, origin })
      setRecentIds([row.id, ...(recentIds ?? []).filter(id => id !== row.id)].slice(0, 8))
      if (mode === 'login') {
        await verifyLogin.mutateAsync({
          ...signed,
          callbackUrl: `${origin}/auth/callback/web3?callbackUrl=/`,
        })
        return
      }
      await verifyLink.mutateAsync(signed)
    } finally {
      setIsPending(false)
    }
  }

  async function connectEip155({ connector }: { connector: (typeof connectors)[number] }) {
    try {
      return await connectAsync({ connector })
    } catch (error) {
      if (
        !(error instanceof ConnectorAlreadyConnectedError) &&
        !(error instanceof Error && error.name === 'ConnectorAlreadyConnectedError')
      )
        throw error
      return { accounts: await connector.getAccounts() }
    }
  }

  async function signEip155({
    row,
    domain,
    origin,
  }: {
    row: WalletRow
    domain: string
    origin: string
  }) {
    const connector =
      connectors.find(item => item.id === row.rdns || item.id === row.id) ??
      connectors.find(item => item.type === 'injected' && row.connectKind === 'injected') ??
      connectors.find(item => item.type === 'walletConnect')
    if (!connector) {
      if (row.deeplink) {
        window.location.href = `${row.deeplink}${encodeURIComponent(origin)}`
        throw new Error('Redirecting to wallet')
      }
      throw new Error('Wallet is not available in this browser')
    }
    const connected = await connectEip155({ connector })
    const account = connected.accounts[0]
    if (!account) throw new Error('No account connected')
    const address = getAddress(account)
    const { nonce } = await client.auth.web3.eip155.nonce({
      query: { address },
      throwOnError: true,
    })
    const message = createSiweMessage({
      address,
      chainId: 1,
      domain,
      nonce,
      uri: origin,
      version: '1',
    })
    const signature = await signMessageAsync({ message })
    return { chain: 'eip155' as const, message, signature, domain }
  }

  async function signSolana({
    row,
    domain,
    origin,
  }: {
    row: WalletRow
    domain: string
    origin: string
  }) {
    const wallet =
      standardWallets.find(item => {
        const id = item.name.toLowerCase().replace(/\s+/g, '-')
        return id === row.id || item.name === row.name
      }) ?? standardWallets.find(item => row.rdns && item.name.toLowerCase().includes(row.id))
    if (!wallet) {
      if (row.deeplink) {
        window.location.href = `${row.deeplink}${encodeURIComponent(origin)}`
        throw new Error('Redirecting to wallet')
      }
      throw new Error('Wallet is not available in this browser')
    }
    const connectFeature = wallet.features['standard:connect'] as
      | { connect: () => Promise<{ accounts: { address: string }[] }> }
      | undefined
    if (connectFeature) await connectFeature.connect()
    const account = wallet.accounts[0]
    if (!account) throw new Error('No Solana account connected')
    const address = account.address
    const { nonce } = await client.auth.web3.solana.nonce({
      query: { address },
      throwOnError: true,
    })
    const message = buildSiwsMessage({ domain, address, nonce, uri: origin })
    const signIn = wallet.features['solana:signIn'] as
      | {
          signIn: (input: {
            domain: string
            address: string
            nonce: string
            uri: string
          }) => Promise<{ signedMessage: Uint8Array; signature: Uint8Array }[]>
        }
      | undefined
    if (signIn) {
      const [result] = await signIn.signIn({ domain, address, nonce, uri: origin })
      if (!result) throw new Error('Solana sign-in failed')
      return {
        chain: 'solana' as const,
        message: new TextDecoder().decode(result.signedMessage),
        signature: bs58.encode(result.signature),
        domain,
      }
    }
    const signMessage = wallet.features['solana:signMessage'] as
      | {
          signMessage: (input: {
            account: typeof account
            message: Uint8Array
          }) => Promise<{ signature: Uint8Array }[]>
        }
      | undefined
    if (!signMessage) throw new Error('Wallet cannot sign a Solana message')
    const encoded = new TextEncoder().encode(message)
    const [signed] = await signMessage.signMessage({ account, message: encoded })
    if (!signed) throw new Error('Solana sign failed')
    return {
      chain: 'solana' as const,
      message,
      signature: bs58.encode(signed.signature),
      domain,
    }
  }

  return { rows, query, setQuery, authenticate, isPending }
}
