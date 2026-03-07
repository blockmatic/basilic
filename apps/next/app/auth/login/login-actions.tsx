'use client'

import { LoginForm, useOAuthLogin, usePasskeyAuth, useWebAuthnAvailable } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { X } from 'lucide-react'
import { useState } from 'react'

type LoginActionsProps = { initialError?: string }

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="text-center">Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-2">
        <span className="flex-1 text-center">{message}</span>
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
  const {
    mutate: startPasskeyAuth,
    error: passkeyError,
    isPending: isPasskeyPending,
  } = usePasskeyAuth()
  const webauthnAvailable = useWebAuthnAvailable()
  const displayError = oauthError?.message ?? passkeyError?.message ?? initialError
  const showBanner = displayError && displayError !== dismissedForError

  return (
    <div>
      {showBanner && (
        <ErrorBanner message={displayError} onDismiss={() => setDismissedForError(displayError)} />
      )}
      <LoginForm
        extraActions={
          <>
            {webauthnAvailable && (
              <Button
                variant="outline"
                type="button"
                disabled={isOAuthPending || isPasskeyPending}
                onClick={() =>
                  startPasskeyAuth({
                    callbackUrl: `${window.location.origin}/auth/callback/passkey?callbackUrl=/`,
                  })
                }
              >
                {isPasskeyPending ? 'Signing in…' : 'Sign in with passkey'}
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              disabled={isOAuthPending || isPasskeyPending}
              onClick={() => startOAuthLogin()}
            >
              {isOAuthPending ? 'Redirecting...' : 'GitHub'}
            </Button>
          </>
        }
      />
    </div>
  )
}
