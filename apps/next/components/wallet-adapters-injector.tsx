'use client'

import { useUser } from '@repo/react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { useEffect, useRef } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { WalletProvider } from '@/wallet/context'
import type { WalletAdapter } from '@/wallet/types'

export function addressesMatch(addr1: string | undefined, addr2: string, chain: string): boolean {
  if (!addr1) return false
  return chain === 'eip155' ? addr1.toLowerCase() === addr2.toLowerCase() : addr1 === addr2
}

function useWalletDisconnectLogout() {
  const { data: userData } = useUser()
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const solanaWallet = useSolanaWallet()
  const prev = useRef({
    evm: isEvmConnected,
    evmAddr: evmAddress,
    solana: solanaWallet.connected,
    solanaAddr: solanaWallet.publicKey?.toBase58(),
  })

  useEffect(() => {
    const session = userData?.user?.wallet
    const p = prev.current

    prev.current = {
      evm: isEvmConnected,
      evmAddr: evmAddress,
      solana: solanaWallet.connected,
      solanaAddr: solanaWallet.publicKey?.toBase58(),
    }

    if (!session?.chain || !session.address) return

    const evmDisconnected =
      session.chain === 'eip155' &&
      p.evm &&
      !isEvmConnected &&
      addressesMatch(p.evmAddr, session.address, 'eip155')
    const solanaDisconnected =
      session.chain === 'solana' &&
      p.solana &&
      !solanaWallet.connected &&
      addressesMatch(p.solanaAddr, session.address, 'solana')

    if (evmDisconnected || solanaDisconnected) {
      window.location.href = '/api/auth/sign-out'
    }
  }, [
    userData?.user?.wallet,
    isEvmConnected,
    evmAddress,
    solanaWallet.connected,
    solanaWallet.publicKey,
  ])
}

function useWalletAdapters(): { eip155?: WalletAdapter; solana?: WalletAdapter } {
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const solanaWallet = useSolanaWallet()

  const eip155 =
    isEvmConnected && evmAddress
      ? {
          chain: 'eip155' as const,
          address: evmAddress,
          signMessage: (msg: string | Uint8Array) =>
            signMessageAsync({
              message: typeof msg === 'string' ? msg : new TextDecoder().decode(msg),
            }).then(sig => ({ signature: sig })),
        }
      : undefined

  const solanaSign = solanaWallet.signMessage
  const solana =
    solanaWallet.connected && solanaWallet.publicKey && solanaSign
      ? {
          chain: 'solana' as const,
          address: solanaWallet.publicKey.toBase58(),
          signMessage: async (msg: string | Uint8Array) => {
            const encoded = typeof msg === 'string' ? new TextEncoder().encode(msg) : msg
            const sig = await solanaSign(encoded)
            return { signature: bs58.encode(sig) }
          },
        }
      : undefined

  return { eip155, solana }
}

export function WalletAdaptersInjector({ children }: { children: React.ReactNode }) {
  useWalletDisconnectLogout()
  const adapters = useWalletAdapters()

  return <WalletProvider adapters={adapters}>{children}</WalletProvider>
}
