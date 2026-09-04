import { ApiError, createClient } from '@repo/core'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

function errorMessage(code: string | undefined) {
  if (code === 'EXPIRED_TOKEN') return 'This sign-out link has expired.'
  if (code === 'INVALID_TOKEN') return 'This sign-out link is invalid.'
  return 'Could not sign out of that device.'
}

export default async function RevokeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; verificationId?: string }>
}) {
  const { token, verificationId } = await searchParams
  if (!token || !verificationId)
    return (
      <RevokeResult
        title="Missing link"
        body="This sign-out link is incomplete. Open the link from your email, or review devices in Settings."
      />
    )

  try {
    await client.auth.sessions.revoke({ body: { token, verificationId } })
  } catch (error) {
    const code =
      error instanceof ApiError ? (error.body as { code?: string } | undefined)?.code : undefined
    return <RevokeResult title="Could not sign out" body={errorMessage(code)} />
  }

  const cookieStore = await cookies()
  const { token: accessToken } = parseAuthCookie(
    cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value,
  )
  if (accessToken) {
    const check = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/sessions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    if (check.status === 401)
      cookieStore.set(env.NEXT_PUBLIC_AUTH_COOKIE_NAME, '', {
        httpOnly: false,
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      })
  }

  return (
    <RevokeResult
      title="Device signed out"
      body="That session is no longer active. If this was you, you can sign in again from a trusted device."
    />
  )
}

function RevokeResult({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-medium">{title}</h1>
      <p className="text-muted-foreground text-sm">{body}</p>
      <p className="text-sm">
        <Link href="/settings/security/sessions" className="underline">
          Review signed-in devices
        </Link>
        {' · '}
        <Link href="/auth/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
