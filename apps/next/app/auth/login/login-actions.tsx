'use client'

import { useMagicLink, useOAuthLogin } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useSetState } from 'ahooks'
import { X } from 'lucide-react'
import { z } from 'zod'

const magicLinkSchema = z.object({ email: z.string().email() })

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

export function LoginActions({ initialError }: { initialError?: string }) {
  const [state, setState] = useSetState({ dismissedError: null as string | null })
  const { mutate: startOAuthLogin, error: oauthError, isPending: isOAuthPending } = useOAuthLogin()
  const { mutate: sendMagicLink, isPending: isMagicLinkPending } = useMagicLink()
  const displayError = oauthError?.message ?? initialError
  const showBanner = displayError && displayError !== state.dismissedError

  return (
    <div className="space-y-4">
      {showBanner && (
        <ErrorBanner
          message={displayError}
          onDismiss={() => setState({ dismissedError: displayError })}
        />
      )}
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault()
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value
          const parsed = magicLinkSchema.safeParse({ email })
          if (!parsed.success) return
          const callbackUrl =
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback/magiclink?callbackURL=/`
              : '/auth/callback/magiclink?callbackURL=/'
          sendMagicLink({ email: parsed.data.email, callbackUrl })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <Button type="submit" className="w-full" disabled={isMagicLinkPending}>
          {isMagicLinkPending ? 'Sending…' : 'Send magic link'}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or continue with</span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        className="w-full"
        disabled={isOAuthPending}
        onClick={() => startOAuthLogin()}
      >
        {isOAuthPending ? 'Redirecting…' : 'GitHub'}
      </Button>
    </div>
  )
}
