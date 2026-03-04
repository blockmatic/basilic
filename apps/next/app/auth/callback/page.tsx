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
  const token = params.token
  const error = params.error || params.message

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error)}`)
  }

  if (!token) {
    redirect('/auth/login?message=Invalid or expired magic link')
  }

  const callbackURL = params.callbackURL?.startsWith('/') ? params.callbackURL : '/'
  const verifyUrl = `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&format=jwt&callbackURL=${encodeURIComponent(
    callbackURL,
  )}`
  redirect(verifyUrl)
}
