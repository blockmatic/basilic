'use client'

import { LoginForm, useOAuthLogin } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { X } from 'lucide-react'
import { useState } from 'react'

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
          <Button
            variant="outline"
            type="button"
            disabled={isOAuthPending}
            onClick={() => startOAuthLogin()}
          >
            {isOAuthPending ? 'Redirecting...' : 'GitHub'}
          </Button>
        }
      />
    </div>
  )
}
