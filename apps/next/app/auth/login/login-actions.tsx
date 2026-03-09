'use client'

import { ApiError } from '@repo/core'
import {
  useOAuthLogin,
  useOAuthProviders,
  usePasskeyAuth,
  usePasskeyDiscovery,
  useWebAuthnAvailable,
} from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Facebook, GitHub, Google, Passkey, Twitter } from '@/components/icons'
import { updateAuthTokens } from '@/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/lib/auth/auth-error-messages'
import { LoginForm } from './login-form'
import { PasskeyShortcut } from './passkey-shortcut'
import { useGoogleOneTap } from './use-google-one-tap'

type LoginActionsProps = { initialError?: string; defaultEmail?: string }

type OAuthButtonsProps = {
  anyPending: boolean
  setLastAuthMethod: (m: 'oauth' | 'passkey') => void
  startOAuthLogin: (p: 'github' | 'facebook' | 'twitter') => void
  promptGoogle: () => void
  isGithubConfigured: boolean
  isGoogleConfigured: boolean
  isGoogleReady: boolean
  isFacebookConfigured: boolean
  isTwitterConfigured: boolean
  isOAuthPending: boolean
  isGooglePending: boolean
  webauthnAvailable: boolean
  startPasskeyAuth: (opts: { callbackUrl: string }) => void
  isPasskeyPending: boolean
}

function OAuthButtons({
  anyPending,
  setLastAuthMethod,
  startOAuthLogin,
  promptGoogle,
  isGithubConfigured,
  isGoogleConfigured,
  isGoogleReady,
  isFacebookConfigured,
  isTwitterConfigured,
  isOAuthPending,
  isGooglePending,
  webauthnAvailable,
  startPasskeyAuth,
  isPasskeyPending,
}: OAuthButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {webauthnAvailable && (
        <button
          type="button"
          disabled={anyPending}
          onClick={() => {
            setLastAuthMethod('passkey')
            startPasskeyAuth({
              callbackUrl: `${window.location.origin}/auth/callback/passkey?callbackUrl=/`,
            })
          }}
          aria-label={isPasskeyPending ? 'Signing in…' : 'Continue with Passkey'}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Passkey className="size-5" aria-hidden />
        </button>
      )}
      <button
        type="button"
        disabled={anyPending || !isGithubConfigured}
        onClick={() => {
          setLastAuthMethod('oauth')
          startOAuthLogin('github')
        }}
        aria-label={isOAuthPending ? 'Redirecting...' : 'Continue with GitHub'}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GitHub className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        disabled={anyPending || !isGoogleConfigured || !isGoogleReady}
        onClick={() => {
          setLastAuthMethod('oauth')
          if (isGoogleConfigured && isGoogleReady) promptGoogle()
        }}
        aria-label={isGooglePending ? 'Signing in…' : 'Continue with Google'}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Google className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        disabled={anyPending || !isFacebookConfigured}
        onClick={() => {
          setLastAuthMethod('oauth')
          startOAuthLogin('facebook')
        }}
        aria-label={isOAuthPending ? 'Redirecting...' : 'Continue with Facebook'}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Facebook className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        disabled={anyPending || !isTwitterConfigured}
        onClick={() => {
          setLastAuthMethod('oauth')
          startOAuthLogin('twitter')
        }}
        aria-label={isOAuthPending ? 'Redirecting...' : 'Continue with X'}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Twitter className="size-5" aria-hidden />
      </button>
    </div>
  )
}

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

export function LoginActions({ initialError, defaultEmail }: LoginActionsProps) {
  const router = useRouter()
  const [dismissedForError, setDismissedForError] = useState<string | null>(null)
  const [lastAuthMethod, setLastAuthMethod] = useState<'oauth' | 'passkey' | null>(null)
  const [optedOutEmails, setOptedOutEmails] = useState<Set<string>>(() => new Set())
  const {
    mutate: startOAuthLogin,
    error: oauthError,
    isPending: isOAuthPending,
  } = useOAuthLogin({
    onError: err => {
      if (err instanceof ApiError && err.status === 503)
        toast.error(getAuthErrorMessage('oauth_not_configured'))
    },
  })
  const {
    github: isGithubConfigured,
    google: isGoogleConfigured,
    facebook: isFacebookConfigured,
    twitter: isTwitterConfigured,
  } = useOAuthProviders()
  const {
    prompt: promptGoogle,
    isPending: isGooglePending,
    isReady: isGoogleReady,
  } = useGoogleOneTap({ enabled: isGoogleConfigured })
  const {
    mutate: startPasskeyAuth,
    error: passkeyError,
    isPending: isPasskeyPending,
  } = usePasskeyAuth()
  const { email: discoveryEmail } = usePasskeyDiscovery()
  const webauthnAvailable = useWebAuthnAvailable()
  const anyPending = isOAuthPending || isPasskeyPending || isGooglePending
  const displayError =
    lastAuthMethod === 'passkey'
      ? (passkeyError?.message ?? oauthError?.message ?? initialError)
      : lastAuthMethod === 'oauth'
        ? (oauthError?.message ?? passkeyError?.message ?? initialError)
        : (oauthError?.message ?? passkeyError?.message ?? initialError)
  const showBanner = displayError && displayError !== dismissedForError

  const showPasskeyShortcut =
    webauthnAvailable && discoveryEmail && !optedOutEmails.has(discoveryEmail)

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
                try {
                  await updateAuthTokens({ token, refreshToken })
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to complete sign-in')
                  return
                }
                router.push('/')
              },
            })
          }}
          onUseAnotherMethod={() =>
            discoveryEmail && setOptedOutEmails(prev => new Set(prev).add(discoveryEmail))
          }
          isPending={isPasskeyPending}
        />
      )}
      <LoginForm
        defaultEmail={defaultEmail}
        initialError={initialError}
        extraActions={
          <OAuthButtons
            anyPending={anyPending}
            setLastAuthMethod={setLastAuthMethod}
            startOAuthLogin={startOAuthLogin}
            promptGoogle={promptGoogle}
            isGithubConfigured={isGithubConfigured}
            isGoogleConfigured={isGoogleConfigured}
            isGoogleReady={isGoogleReady}
            isFacebookConfigured={isFacebookConfigured}
            isTwitterConfigured={isTwitterConfigured}
            isOAuthPending={isOAuthPending}
            isGooglePending={isGooglePending}
            webauthnAvailable={webauthnAvailable}
            startPasskeyAuth={startPasskeyAuth}
            isPasskeyPending={isPasskeyPending}
          />
        }
      />
    </div>
  )
}
