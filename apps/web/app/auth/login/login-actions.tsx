'use client'

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
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Facebook, GitHub, Google, Passkey, Twitter } from '@/components/icons'
import { capture } from '@/lib/analytics'
import { getApiErrorCode } from '@/lib/auth/api-error'
import { updateAuthTokens } from '@/lib/auth/auth-client'
import { LoginForm } from './login-form'
import { PasskeyShortcut } from './passkey-shortcut'
import { useGoogleOneTap } from './use-google-one-tap'

type LoginActionsProps = { initialError?: string }

type OAuthButtonsProps = {
  anyPending: boolean
  setLastAuthMethod: (m: 'oauth' | 'passkey') => void
  startOAuthLogin: (p: 'github' | 'google' | 'facebook' | 'twitter') => void
  onGoogleClick: () => void
  isGithubConfigured: boolean
  isGoogleConfigured: boolean
  isGoogleRedirectConfigured: boolean
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
  onGoogleClick,
  isGithubConfigured,
  isGoogleConfigured,
  isGoogleRedirectConfigured,
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
        disabled={
          anyPending || !isGoogleConfigured || (!isGoogleRedirectConfigured && !isGoogleReady)
        }
        onClick={() => {
          setLastAuthMethod('oauth')
          onGoogleClick()
        }}
        aria-label={isGooglePending || isOAuthPending ? 'Signing in…' : 'Continue with Google'}
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

export function LoginActions({ initialError }: LoginActionsProps): React.JSX.Element {
  const router = useRouter()
  const [dismissedForError, setDismissedForError] = useState<string | null>(null)
  const [lastAuthMethod, setLastAuthMethod] = useState<'oauth' | 'passkey' | null>(null)
  const [optedOutEmails, setOptedOutEmails] = useState<Set<string>>(() => new Set())
  const [oneTapSkipped, setOneTapSkipped] = useState(false)
  const { mutate: startOAuthLogin, error: oauthError, isPending: isOAuthPending } = useOAuthLogin()
  const {
    github: isGithubConfigured,
    google: isGoogleConfigured,
    googleHasRedirectConfig: isGoogleRedirectConfigured,
    facebook: isFacebookConfigured,
    twitter: isTwitterConfigured,
  } = useOAuthProviders()
  const {
    prompt: promptGoogle,
    isPending: isGooglePending,
    isReady: isGoogleReady,
  } = useGoogleOneTap({
    enabled: isGoogleConfigured,
    onSkipped: useCallback(() => setOneTapSkipped(true), []),
  })
  const {
    mutate: startPasskeyAuth,
    error: passkeyError,
    isPending: isPasskeyPending,
  } = usePasskeyAuth()
  const capturePasskeyFailed = (err: unknown) => {
    capture({
      name: 'auth_failed',
      method: 'passkey',
      errorCode: getApiErrorCode(err) ?? 'PASSKEY_FAILED',
    })
  }
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

  const handleGoogleClick = useCallback(() => {
    const useRedirect = (oneTapSkipped || !isGoogleReady) && isGoogleRedirectConfigured
    if (useRedirect) {
      startOAuthLogin('google')
      return
    }
    if (!isGoogleReady) return
    promptGoogle()
  }, [oneTapSkipped, isGoogleReady, isGoogleRedirectConfigured, startOAuthLogin, promptGoogle])

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
            startPasskeyAuth(
              {
                onSuccess: async ({ token, refreshToken }) => {
                  try {
                    await updateAuthTokens({ token, refreshToken })
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Failed to complete sign-in')
                    return
                  }
                  capture({ name: 'auth_succeeded', method: 'passkey' })
                  router.push('/')
                },
              },
              { onError: capturePasskeyFailed },
            )
          }}
          onUseAnotherMethod={() =>
            discoveryEmail && setOptedOutEmails(prev => new Set(prev).add(discoveryEmail))
          }
          isPending={isPasskeyPending}
        />
      )}
      <LoginForm
        initialError={initialError}
        onVerifySuccess={async ({ token, refreshToken }) => {
          try {
            await updateAuthTokens({ token, refreshToken })
            capture({ name: 'auth_succeeded', method: 'magic_link' })
            router.push('/')
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to complete sign-in')
          }
        }}
        extraActions={
          <OAuthButtons
            anyPending={anyPending}
            setLastAuthMethod={setLastAuthMethod}
            startOAuthLogin={startOAuthLogin}
            onGoogleClick={handleGoogleClick}
            isGithubConfigured={isGithubConfigured}
            isGoogleConfigured={isGoogleConfigured}
            isGoogleRedirectConfigured={isGoogleRedirectConfigured}
            isGoogleReady={isGoogleReady}
            isFacebookConfigured={isFacebookConfigured}
            isTwitterConfigured={isTwitterConfigured}
            isOAuthPending={isOAuthPending}
            isGooglePending={isGooglePending}
            webauthnAvailable={webauthnAvailable}
            startPasskeyAuth={opts => startPasskeyAuth(opts, { onError: capturePasskeyFailed })}
            isPasskeyPending={isPasskeyPending}
          />
        }
      />
    </div>
  )
}
