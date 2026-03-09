import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { getAuthErrorMessage } from 'lib/auth/auth-error-messages'
import { GalleryVerticalEnd } from 'lucide-react'
import Image from 'next/image'
import { LoginActions } from './login-actions'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const errorParam = params.error || params.message
  const errorMessage = getAuthErrorMessage(errorParam)

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
            <LoginActions initialError={errorMessage} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/images/auth-login-hero.webp"
          alt="Login"
          fill
          className="object-cover dark:brightness-[0.6] dark:saturate-[0.8]"
        />
      </div>
    </div>
  )
}
