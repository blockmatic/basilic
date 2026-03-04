'use client'

import { useLinkEmail } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { useVerifyLinkEmailToken } from 'app/(dashboard)/use-verify-link-email-token'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { updateAuthTokens } from 'lib/auth/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ChatAssistant } from '../../components/assistant'
import { SignOutButton } from './sign-out-button'

function DashboardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

type User = {
  email?: string | null
  name?: string | null
  emailVerified?: boolean | null
}

type DashboardWalletContentProps = {
  user: User
}

export function DashboardWalletContent({ user }: DashboardWalletContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const [email, setEmail] = useState('')

  const {
    requestLink,
    verifyFromToken,
    isRequestPending,
    isVerifyPending,
    error: linkEmailError,
    isReady,
  } = useLinkEmail({
    onVerifySuccess: async ({ token, refreshToken }) => {
      await updateAuthTokens({ token, refreshToken })
      router.replace('/')
    },
  })

  useVerifyLinkEmailToken(tokenParam, isReady, verifyFromToken)

  const handleRequestLinkEmail = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    requestLink({ email, callbackUrl: `${origin}/` })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.email ?? user.name ?? 'User'}!
            </p>
          </div>
          <div className="flex gap-2">
            <ApiHealthBadge />
            <AuthBadge />
            <SignOutButton />
          </div>
        </div>
        <div className="space-y-6 max-w-2xl">
          <DashboardSection title="Account">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span> {user.email ?? 'Not linked'}
              </p>
            </div>
          </DashboardSection>

          <DashboardSection title="Link email">
            {!user.email ? (
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={!isReady || isRequestPending}
                  onClick={handleRequestLinkEmail}
                >
                  {isRequestPending ? 'Sending…' : 'Request link email'}
                </Button>
                {isVerifyPending && <p className="text-muted-foreground text-sm">Verifying…</p>}
                {linkEmailError && (
                  <p className="text-destructive text-xs">{linkEmailError.message}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Email already linked: {user.email}</p>
            )}
          </DashboardSection>
        </div>
      </div>
      <ChatAssistant />
    </div>
  )
}
