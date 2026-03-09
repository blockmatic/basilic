'use client'

import { ApiError } from '@repo/core'
import {
  LoginForm,
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
import { setLastMagicLinkEmailCookie } from '@/lib/auth/last-magic-link-email-client'
import { PasskeyShortcut } from './passkey-shortcut'
import { useGoogleOneTap } from './use-google-one-tap'

type LoginActionsProps = { initialError?: string; defaultEmail?: string }

function OAuthButtons({
  anyPending,
  setLastAuthMethod,
  startOAuthLogin,
  promptGoogle,
  isGithubConfigured,
  isGoogleConfigured,
  isFacebookConfigured,
  isTwitterConfigured,
  isOAuthPending,
  isGooglePending,
  webauthnAvailable,
  startPasskeyAuth,
  isPasskeyPending,
}: {
  anyPending: boolean
  setLastAuthMethod: (m: 'oauth' | 'passkey') => void
  startOAuthLogin: (p: 'github' | 'facebook' | 'twitter') => void
  promptGoogle: () => void
  isGithubConfigured: boolean
  isGoogleConfigured: boolean
  isFacebookConfigured: boolean
  isTwitterConfigured: boolean
  isOAuthPending: boolean
  isGooglePending: boolean
  webauthnAvailable: boolean
  startPasskeyAuth: (opts: { callbackUrl: string }) => void
  isPasskeyPending: boolean
}) {
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
        disabled={anyPending || !isGoogleConfigured}
        onClick={() => {
          setLastAuthMethod('oauth')
          promptGoogle()
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
  const [optedOut, setOptedOut] = useState(false)
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
  const { prompt: promptGoogle, isPending: isGooglePending } = useGoogleOneTap()
  const {
    github: isGithubConfigured,
    google: isGoogleConfigured,
    facebook: isFacebookConfigured,
    twitter: isTwitterConfigured,
  } = useOAuthProviders()
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
        defaultEmail={defaultEmail}
        onMagicLinkSent={setLastMagicLinkEmailCookie}
        extraActions={
          <OAuthButtons
            anyPending={anyPending}
            setLastAuthMethod={setLastAuthMethod}
            startOAuthLogin={startOAuthLogin}
            promptGoogle={promptGoogle}
            isGithubConfigured={isGithubConfigured}
            isGoogleConfigured={isGoogleConfigured}
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
