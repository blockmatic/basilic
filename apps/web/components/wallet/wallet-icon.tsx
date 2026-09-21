'use client'

import {
  WalletBackpack,
  WalletCoinbase,
  WalletMetamask,
  WalletOkx,
  WalletPhantom,
  WalletRabby,
  WalletRainbow,
  WalletSolflare,
  WalletTrust,
  WalletWalletConnect,
} from '@web3icons/react'
import { Wallet } from 'lucide-react'
import { BraveWalletIcon } from '@/components/icons/wallets'

export function WalletGlyph({ icon, className }: { icon: string; className?: string }) {
  const branded = { className, variant: 'branded' as const }
  if (icon === 'metamask') return <WalletMetamask {...branded} />
  if (icon === 'coinbase') return <WalletCoinbase {...branded} />
  if (icon === 'rainbow') return <WalletRainbow {...branded} />
  if (icon === 'rabby') return <WalletRabby {...branded} />
  if (icon === 'phantom') return <WalletPhantom {...branded} />
  if (icon === 'backpack') return <WalletBackpack {...branded} />
  if (icon === 'okx') return <WalletOkx {...branded} />
  if (icon === 'trust') return <WalletTrust {...branded} />
  if (icon === 'solflare') return <WalletSolflare {...branded} />
  if (icon === 'walletconnect') return <WalletWalletConnect {...branded} />
  if (icon === 'brave') return <BraveWalletIcon className={className} />
  return <Wallet className={className} aria-hidden />
}
