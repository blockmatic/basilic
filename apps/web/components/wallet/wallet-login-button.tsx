'use client'

import { Wallet } from 'lucide-react'
import { useState } from 'react'
import { WalletModal } from './wallet-modal'

export function WalletLoginButton({
  disabled,
  onError,
}: {
  disabled: boolean
  onError: (error: unknown) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label="Continue with Wallet"
        data-testid="login-wallet"
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Wallet className="size-5" aria-hidden />
      </button>
      <WalletModal open={open} onOpenChange={setOpen} mode="login" onError={onError} />
    </>
  )
}
