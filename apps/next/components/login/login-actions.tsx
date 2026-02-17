'use client'

import { LoginForm, useOAuthLogin } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { X } from 'lucide-react'
import { useState } from 'react'
import { WalletOptionsView } from './wallet-options-view'

type LoginActionsProps = { initialError?: string }

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-2">
        <span>{message}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function LoginActions({ initialError }: LoginActionsProps) {
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const { mutate: startOAuthLogin, isPending: isOAuthPending } = useOAuthLogin()

  return (
    <div data-view={showWalletOptions ? 'wallet' : 'initial'} className="group/view relative">
      {initialError && !errorDismissed && (
        <ErrorBanner message={initialError} onDismiss={() => setErrorDismissed(true)} />
      )}
      <div
        data-view-panel="initial"
        className={cn(
          'transition-opacity duration-200 motion-reduce:transition-none',
          'group-data-[view=wallet]:pointer-events-none group-data-[view=wallet]:absolute group-data-[view=wallet]:inset-0 group-data-[view=wallet]:opacity-0',
        )}
      >
        <LoginForm
          extraActions={
            <>
              <Button
                variant="outline"
                type="button"
                disabled={isOAuthPending}
                onClick={() => startOAuthLogin()}
              >
                {isOAuthPending ? 'Redirecting...' : 'Continue with GitHub'}
              </Button>
              <Button variant="outline" type="button" onClick={() => setShowWalletOptions(true)}>
                Wallet login
              </Button>
            </>
          }
        />
      </div>
      <div
        data-view-panel="wallet"
        className={cn(
          'transition-opacity duration-200 motion-reduce:transition-none',
          'group-data-[view=initial]:pointer-events-none group-data-[view=initial]:absolute group-data-[view=initial]:inset-0 group-data-[view=initial]:opacity-0',
        )}
      >
        <WalletOptionsView onBack={() => setShowWalletOptions(false)} />
      </div>
    </div>
  )
}
