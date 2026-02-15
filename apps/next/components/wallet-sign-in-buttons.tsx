'use client'

import { useWallet, useWalletAuth } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useChainId } from 'wagmi'

function SignInWithEthereumButton() {
  const adapter = useWallet('eip155')
  const chainId = useChainId()
  const { signIn, isPending, error } = useWalletAuth({ adapter, chainId })

  if (!adapter?.address) return null

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
  const adapter = useWallet('solana')
  const { setVisible } = useWalletModal()
  const { signIn, isPending, error } = useWalletAuth({ adapter })

  if (!adapter?.address) {
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
