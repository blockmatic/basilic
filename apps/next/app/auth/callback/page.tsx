import { redirect } from 'next/navigation'

type AuthCallbackPageProps = {
  searchParams: Promise<{
    token?: string
    verificationId?: string
    format?: string
    error?: string
    message?: string
    callbackURL?: string
  }>
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams
  const error = params.error || params.message

  if (error) redirect(`/auth/login?message=${encodeURIComponent(error)}`)

  const callbackURL = params.callbackURL?.startsWith('/') ? params.callbackURL : '/'

  const verificationId = params.verificationId
  if (verificationId)
    redirect(
      `/auth/callback/magiclink?verificationId=${encodeURIComponent(verificationId)}&callbackURL=${encodeURIComponent(callbackURL)}`,
    )

  const token = params.token
  if (token)
    redirect(
      `/auth/callback/magiclink?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`,
    )

  redirect('/auth/login?message=Invalid or expired magic link')
}
