'use client'

import { useWallet } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ArrowLeft } from 'lucide-react'
import { useChainId, useConnect } from 'wagmi'
import { WalletSignInRow } from '@/components/wallet-sign-in-buttons'

export function WalletOptionsView({ onBack }: { onBack: () => void }) {
  const evmAdapter = useWallet('eip155')
  const solanaAdapter = useWallet('solana')
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const { setVisible: setSolanaModalVisible } = useWalletModal()
  const injected = connectors.find(c => c.type === 'injected' || c.id?.includes('injected'))

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
        <WalletSignInRow
          label="Sign in with Ethereum"
          adapter={evmAdapter}
          chainId={chainId}
          connectLabel="Connect MetaMask"
          connectDisabled={!injected}
          onConnect={() => (injected ? connect({ connector: injected }) : undefined)}
        />
        <WalletSignInRow
          label="Sign in with Solana"
          adapter={solanaAdapter}
          connectLabel="Connect Solana wallet"
          onConnect={() => setSolanaModalVisible(true)}
        />
        <Button variant="outline" disabled>
          WalletConnect (Coming soon)
        </Button>
      </div>
    </div>
  )
}
