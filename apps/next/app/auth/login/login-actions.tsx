'use client'

import {
  LoginForm,
  useOAuthLogin,
  usePasskeyAuth,
  usePasskeyDiscovery,
  useWebAuthnAvailable,
} from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateAuthTokens } from '@/lib/auth/auth-client'
import { PasskeyShortcut } from './passkey-shortcut'

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
  const router = useRouter()
  const [dismissedForError, setDismissedForError] = useState<string | null>(null)
  const [lastAuthMethod, setLastAuthMethod] = useState<'oauth' | 'passkey' | null>(null)
  const [optedOut, setOptedOut] = useState(false)
  const { mutate: startOAuthLogin, error: oauthError, isPending: isOAuthPending } = useOAuthLogin()
  const {
    mutate: startPasskeyAuth,
    error: passkeyError,
    isPending: isPasskeyPending,
  } = usePasskeyAuth()
  const { email: discoveryEmail } = usePasskeyDiscovery()
  const webauthnAvailable = useWebAuthnAvailable()
  const displayError =
    lastAuthMethod === 'passkey'
      ? (passkeyError?.message ?? oauthError?.message ?? initialError)
      : lastAuthMethod === 'oauth'
        ? (oauthError?.message ?? passkeyError?.message ?? initialError)
        : (oauthError?.message ?? passkeyError?.message ?? initialError)
  const showBanner = displayError && displayError !== dismissedForError

  const showPasskeyShortcut = discoveryEmail && !optedOut

  return (
    <div className="flex flex-col gap-4">
      {showBanner && (
        <ErrorBanner message={displayError} onDismiss={() => setDismissedForError(displayError)} />
      )}
      {showPasskeyShortcut && (
        <PasskeyShortcut
          email={discoveryEmail}
          onUsePasskey={() => {
            setLastAuthMethod('passkey')
            startPasskeyAuth({
              onSuccess: async ({ token, refreshToken }) => {
                await updateAuthTokens({ token, refreshToken })
                router.push('/')
              },
            })
          }}
          onUseAnotherMethod={() => setOptedOut(true)}
          isPending={isPasskeyPending}
        />
      )}
      <LoginForm
        extraActions={
          <>
            {webauthnAvailable && (
              <Button
                variant="outline"
                type="button"
                disabled={isOAuthPending || isPasskeyPending}
                onClick={() => {
                  setLastAuthMethod('passkey')
                  startPasskeyAuth({
                    callbackUrl: `${window.location.origin}/auth/callback/passkey?callbackUrl=/`,
                  })
                }}
              >
                {isPasskeyPending ? 'Signing in…' : 'Passkey'}
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              disabled={isOAuthPending || isPasskeyPending}
              onClick={() => {
                setLastAuthMethod('oauth')
                startOAuthLogin()
              }}
            >
              {isOAuthPending ? 'Redirecting...' : 'GitHub'}
            </Button>
          </>
        }
      />
    </div>
  )
}
