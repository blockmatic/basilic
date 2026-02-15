'use client'

import type { WalletAdapter } from '@repo/react'
import { useUser, WalletProvider } from '@repo/react'
import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { useEffect, useRef } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

function useWalletDisconnectLogout() {
  const { data: userData } = useUser()
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const solanaWallet = useWallet()
  const prevEvm = useRef(isEvmConnected)
  const prevEvmAddress = useRef(evmAddress)
  const prevSolana = useRef(solanaWallet.connected)
  const prevSolanaAddress = useRef(solanaWallet.publicKey?.toBase58())

  useEffect(() => {
    const sessionWallet = userData?.user?.wallet
    const wasEvmConnected = prevEvm.current
    const wasEvmAddr = prevEvmAddress.current
    const wasSolanaConnected = prevSolana.current
    const wasSolanaAddr = prevSolanaAddress.current

    prevEvm.current = isEvmConnected
    prevEvmAddress.current = evmAddress
    prevSolana.current = solanaWallet.connected
    prevSolanaAddress.current = solanaWallet.publicKey?.toBase58()

    if (!sessionWallet?.chain || !sessionWallet?.address) return

    const evmDisconnectMatch =
      sessionWallet.chain === 'eip155' &&
      wasEvmConnected &&
      !isEvmConnected &&
      wasEvmAddr != null &&
      wasEvmAddr.toLowerCase() === sessionWallet.address.toLowerCase()
    const solanaDisconnectMatch =
      sessionWallet.chain === 'solana' &&
      wasSolanaConnected &&
      !solanaWallet.connected &&
      wasSolanaAddr != null &&
      wasSolanaAddr === sessionWallet.address

    if (evmDisconnectMatch || solanaDisconnectMatch) {
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

function WalletAdaptersInner({ children }: { children: React.ReactNode }) {
  useWalletDisconnectLogout()

  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const solanaWallet = useWallet()

  const eip155Adapter: WalletAdapter | undefined =
    isEvmConnected && evmAddress
      ? {
          chain: 'eip155',
          address: evmAddress,
          signMessage: async msg =>
            signMessageAsync({
              message: typeof msg === 'string' ? msg : new TextDecoder().decode(msg),
            }).then(sig => ({ signature: sig })),
        }
      : undefined

  const solanaAdapter: WalletAdapter | undefined =
    solanaWallet.connected && solanaWallet.publicKey && solanaWallet.signMessage
      ? {
          chain: 'solana',
          address: solanaWallet.publicKey.toBase58(),
          signMessage: async msg => {
            const encoded = typeof msg === 'string' ? new TextEncoder().encode(msg) : msg
            if (!solanaWallet.signMessage) throw new Error('Wallet does not support signing')
            const sig = await solanaWallet.signMessage(encoded)
            return { signature: bs58.encode(sig) }
          },
        }
      : undefined

  return (
    <WalletProvider
      adapters={{
        eip155: eip155Adapter,
        solana: solanaAdapter,
      }}
    >
      {children}
    </WalletProvider>
  )
}

export function WalletAdaptersInjector({ children }: { children: React.ReactNode }) {
  return <WalletAdaptersInner>{children}</WalletAdaptersInner>
}
