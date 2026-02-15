'use client'

import type { WalletAdapter } from '@repo/react'
import { useWallet, useWalletAuth } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useChainId } from 'wagmi'

function WalletSignInRow({
  label,
  adapter,
  chainId,
  connectLabel,
  onConnect,
}: {
  label: string
  adapter: WalletAdapter | undefined
  chainId?: number
  connectLabel?: string
  onConnect?: () => void
}) {
  const { signIn, isPending, error } = useWalletAuth({ adapter, chainId })

  if (!adapter?.address) {
    if (connectLabel && onConnect) {
      return (
        <Button variant="outline" type="button" onClick={onConnect}>
          {connectLabel}
        </Button>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" type="button" disabled={isPending} onClick={() => signIn()}>
        {isPending ? 'Signing...' : label}
      </Button>
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  )
}

export function WalletSignInButtons() {
  const evmAdapter = useWallet('eip155')
  const solanaAdapter = useWallet('solana')
  const chainId = useChainId()
  const { setVisible: setSolanaModalVisible } = useWalletModal()

  return (
    <div className="flex flex-col gap-2">
      <WalletSignInRow label="Sign in with Ethereum" adapter={evmAdapter} chainId={chainId} />
      <WalletSignInRow
        label="Sign in with Solana"
        adapter={solanaAdapter}
        connectLabel="Connect Solana wallet"
        onConnect={() => setSolanaModalVisible(true)}
      />
    </div>
  )
}
