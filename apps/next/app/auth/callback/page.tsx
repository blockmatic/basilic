import { redirect } from 'next/navigation'

type AuthCallbackPageProps = {
  searchParams: Promise<{
    token?: string
    format?: string
    error?: string
    message?: string
    callbackURL?: string
  }>
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams
  const error = params.error || params.message

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error)}`)
  }

  const token = params.token
  const callbackURL = params.callbackURL?.startsWith('/') ? params.callbackURL : '/'

  if (!token) {
    redirect('/auth/login?message=Invalid or expired magic link')
  }

  redirect(
    `/auth/callback/magiclink?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`,
  )
}
