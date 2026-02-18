'use client'

import { Button } from '@repo/ui/components/button'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useChainId, useConnect } from 'wagmi'
import { useWallet } from '@/hooks/use-wallet'
import { useWalletAuth } from '@/hooks/use-wallet-auth'
import { WALLET_ROW_CONFIG } from '@/lib/wallet-row-config'
import type { WalletAdapter } from '@/wallet/types'

export function WalletSignInRow({
  label,
  adapter,
  chainId,
  connectLabel,
  connectDisabled,
  onConnect,
}: {
  label: string
  adapter: WalletAdapter | undefined
  chainId?: number
  connectLabel?: string
  connectDisabled?: boolean
  onConnect?: () => void
}) {
  const { signIn, isPending, error } = useWalletAuth({ adapter, chainId })

  if (!adapter?.address) {
    if (connectLabel && onConnect) {
      return (
        <Button
          variant="outline"
          type="button"
          disabled={connectDisabled}
          onClick={() => onConnect()}
        >
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
  const { connect, connectors } = useConnect()
  const { setVisible: setSolanaModalVisible } = useWalletModal()
  const injected = connectors.find(c => c.type === 'injected' || c.id?.includes('injected'))
  const adapters = { eip155: evmAdapter, solana: solanaAdapter }

  return (
    <div className="flex flex-col gap-2">
      {WALLET_ROW_CONFIG.map(({ chain, label, connectLabel }) => (
        <WalletSignInRow
          key={chain}
          label={label}
          adapter={adapters[chain]}
          chainId={chain === 'eip155' ? chainId : undefined}
          connectLabel={connectLabel}
          connectDisabled={chain === 'eip155' ? !injected : undefined}
          onConnect={
            chain === 'eip155'
              ? () => (injected ? connect({ connector: injected }) : undefined)
              : () => setSolanaModalVisible(true)
          }
        />
      ))}
    </div>
  )
}
