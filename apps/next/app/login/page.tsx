import { GalleryVerticalEnd } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ApiHealthBadge } from '@/components/api-health-badge'
import { AuthBadge } from '@/components/auth-badge'
import { LoginActionsClient } from '@/components/login/login-actions-client'
import { getAuthStatus } from '@/lib/auth-utils'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const { authenticated } = await getAuthStatus()

  if (authenticated) {
    redirect('/')
  }

  const errorParam = params.error || params.message

  // Convert error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    INVALID_TOKEN: 'Invalid or expired magic link',
    EXPIRED_TOKEN: 'Magic link has expired',
    TOKEN_NOT_FOUND: 'Magic link not found',
    missing_params: 'Invalid sign-in link - missing parameters',
    INVALID_STATE: 'Invalid or expired sign-in session. Please try again.',
    EXPIRED_STATE: 'Sign-in session expired. Please try again.',
    TOKEN_EXCHANGE_FAILED: 'GitHub sign-in failed. Please try again.',
    FETCH_USER_FAILED: 'Could not load your GitHub profile. Please try again.',
    EMAIL_REQUIRED: 'No verified email found. Please add a verified email to your GitHub account.',
    OAUTH_NOT_CONFIGURED: 'Sign-in is temporarily unavailable.',
    oauth_failed: 'GitHub sign-in failed. Please try again.',
    unexpected_error: 'Something went wrong. Please try again.',
  }

  const errorMessage = errorParam ? (errorMessages[errorParam] ?? 'An error occurred') : undefined

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </a>
          </div>
          <div className="flex gap-2">
            <ApiHealthBadge />
            <AuthBadge />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginActionsClient initialError={errorMessage} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Image"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
