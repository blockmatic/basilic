'use client'

import { LoginForm, useOAuthLogin } from '@repo/react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { X } from 'lucide-react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useState } from 'react'

const tabParser = parseAsStringLiteral(['signin', 'signup']).withDefault('signin')

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
  const [tab, setTab] = useQueryState('tab', tabParser)
  const [dismissedForError, setDismissedForError] = useState<string | null>(null)
  const { mutate: startOAuthLogin, error: oauthError, isPending: isOAuthPending } = useOAuthLogin()
  const displayError = oauthError?.message ?? initialError
  const showBanner = displayError && displayError !== dismissedForError

  return (
    <div className="flex flex-col gap-4">
      {showBanner && (
        <ErrorBanner message={displayError} onDismiss={() => setDismissedForError(displayError)} />
      )}
      <Tabs value={tab} onValueChange={v => setTab(v as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin" className="mt-4">
          <LoginForm
            variant="signin"
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
        </TabsContent>
        <TabsContent value="signup" className="mt-4">
          <LoginForm
            variant="signup"
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
