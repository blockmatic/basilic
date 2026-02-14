'use client'

import { useWalletAuth } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import bs58 from 'bs58'
import { useAccount, useSignMessage } from 'wagmi'

function SignInWithEthereumButton() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { signIn, isPending, error } = useWalletAuth({
    chain: 'eip155',
    address: isConnected ? address : undefined,
    signMessage: async message => {
      const sig = await signMessageAsync({ message: message as string })
      return { signature: sig }
    },
  })

  if (!isConnected || !address) return null

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" type="button" disabled={isPending} onClick={() => signIn()}>
        {isPending ? 'Signing...' : 'Sign in with Ethereum'}
      </Button>
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  )
}

function SignInWithSolanaButton() {
  const { publicKey, signMessage, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { signIn, isPending, error } = useWalletAuth({
    chain: 'solana',
    address: publicKey?.toBase58(),
    signMessage: async message => {
      if (!signMessage) throw new Error('Wallet does not support signing')
      const encoded = typeof message === 'string' ? new TextEncoder().encode(message) : message
      const sig = await signMessage(encoded)
      return { signature: bs58.encode(sig) }
    },
  })

  if (!connected || !publicKey) {
    return (
      <Button variant="outline" type="button" onClick={() => setVisible(true)}>
        Connect Solana wallet
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" type="button" disabled={isPending} onClick={() => signIn()}>
        {isPending ? 'Signing...' : 'Sign in with Solana'}
      </Button>
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  )
}

export function WalletSignInButtons() {
  return (
    <div className="flex flex-col gap-2">
      <SignInWithEthereumButton />
      <SignInWithSolanaButton />
    </div>
  )
}
