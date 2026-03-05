'use client'

import { LoginForm, useOAuthLogin } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Ethereum } from '@/components/icons/ethereum'
import { GitHub } from '@/components/icons/github'
import { Passkey } from '@/components/icons/passkey'
import { Solana } from '@/components/icons/solana'

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
  const [dismissedForError, setDismissedForError] = useState<string | null>(null)
  const { mutate: startOAuthLogin, error: oauthError, isPending: isOAuthPending } = useOAuthLogin()
  const displayError = oauthError?.message ?? initialError
  const showBanner = displayError && displayError !== dismissedForError

  return (
    <div>
      {showBanner && (
        <ErrorBanner message={displayError} onDismiss={() => setDismissedForError(displayError)} />
      )}
      <LoginForm
        extraActions={
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={isOAuthPending}
              onClick={() => startOAuthLogin()}
              aria-label={isOAuthPending ? 'Redirecting...' : 'Continue with GitHub'}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed"
            >
              <GitHub className="size-5 shrink-0 cursor-pointer" aria-hidden />
            </button>
            <button
              type="button"
              disabled
              aria-label="Continue with Passkey (coming soon)"
              title="Coming soon"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed"
            >
              <Passkey className="size-5 shrink-0 cursor-pointer" aria-hidden />
            </button>
            <button
              type="button"
              disabled
              aria-label="Continue with Ethereum (coming soon)"
              title="Coming soon"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed"
            >
              <Ethereum className="size-5 shrink-0 cursor-pointer" aria-hidden />
            </button>
            <button
              type="button"
              disabled
              aria-label="Continue with Solana (coming soon)"
              title="Coming soon"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed"
            >
              <Solana className="size-5 shrink-0 cursor-pointer" aria-hidden />
            </button>
          </div>
        }
      />
    </div>
  )
}
