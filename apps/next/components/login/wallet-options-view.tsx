'use client'

import { Button } from '@repo/ui/components/button'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ArrowLeft } from 'lucide-react'
import { useChainId, useConnect } from 'wagmi'
import { WalletSignInRow } from '@/components/wallet-sign-in-buttons'
import { useWallet } from '@/hooks/use-wallet'
import { WALLET_ROW_CONFIG } from '@/lib/wallet-row-config'

export function WalletOptionsView({ onBack }: { onBack: () => void }) {
  const evmAdapter = useWallet('eip155')
  const solanaAdapter = useWallet('solana')
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const { setVisible: setSolanaModalVisible } = useWalletModal()
  const injected = connectors.find(c => c.type === 'injected' || c.id?.includes('injected'))
  const adapters = { eip155: evmAdapter, solana: solanaAdapter }

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="-ml-2 self-start"
        onClick={onBack}
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <h2 className="text-lg font-semibold">Connect wallet</h2>
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
    </div>
  )
}
