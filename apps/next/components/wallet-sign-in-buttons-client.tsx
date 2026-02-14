'use client'

import dynamic from 'next/dynamic'

export const WalletSignInButtons = dynamic(
  () => import('@/components/wallet-sign-in-buttons').then(m => m.WalletSignInButtons),
  { ssr: false },
)
