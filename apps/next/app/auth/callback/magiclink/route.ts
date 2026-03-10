import { ApiError, createClient } from '@repo/core'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

const sixDigitCode = /^\d{6}$/
const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isSafeCallbackUrl(raw: string | null, requestUrl: string): string {
  if (!raw || !raw.startsWith('/')) return '/'
  if (raw.startsWith('//')) return '/'
  try {
    const url = new URL(raw, requestUrl)
    if (url.origin !== new URL(requestUrl).origin) return '/'
    return url.pathname + url.search + url.hash
  } catch {
    return '/'
  }
}

function renderCodeEntryForm(verificationId: string, callbackURL: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Enter code - Acme</title>
<style>body{font-family:system-ui,sans-serif;max-width:24rem;margin:2rem auto;padding:0 1rem}
input{padding:0.5rem;font-size:1rem;width:100%;box-sizing:border-box}
button{width:100%;padding:0.5rem 1rem;margin-top:0.5rem;cursor:pointer}
.error{color:#dc2626;font-size:0.875rem;margin-top:0.25rem}
a{color:inherit}
</style></head>
<body>
  <h1>Enter your code</h1>
  <p>Enter the 6-digit code from your email to sign in.</p>
  <form method="POST" action="/auth/callback/magiclink">
    <input type="hidden" name="verificationId" value="${verificationId.replace(/"/g, '&quot;')}"/>
    <input type="hidden" name="callbackURL" value="${callbackURL.replace(/"/g, '&quot;')}"/>
    <label for="token">Code</label>
    <input id="token" name="token" type="text" inputmode="numeric" pattern="\\d*" maxlength="6" autocomplete="one-time-code" placeholder="000000" required/>
    <button type="submit">Verify</button>
  </form>
  <p style="margin-top:1rem"><a href="/auth/login">Back to login</a></p>
</body>
</html>`
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const verificationId = searchParams.get('verificationId')
  const token = searchParams.get('token')
  const rawCallback = searchParams.get('callbackURL')
  const callbackURL = isSafeCallbackUrl(rawCallback, request.url)

  const hasValidVerificationId = Boolean(verificationId && uuidLike.test(verificationId))
  const hasValidToken = Boolean(token && sixDigitCode.test(token))

  if (hasValidVerificationId && hasValidToken && verificationId && token)
    try {
      const response = await client.auth.magiclink.verify({
        body: { verificationId, token },
      })
      const tokens = extractTokens(response)
      if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('FAILED_VERIFY')}`)

      const redirectResponse = NextResponse.redirect(new URL(callbackURL ?? '/', request.url), 303)
      setAuthCookiesOnResponse(redirectResponse, tokens)
      return redirectResponse
    } catch (error) {
      const body =
        error instanceof ApiError ? (error.body as { code?: string } | undefined) : undefined
      const code =
        error instanceof ApiError
          ? error.status === 401
            ? body?.code === 'EXPIRED_TOKEN'
              ? 'EXPIRED_TOKEN'
              : 'INVALID_TOKEN'
            : 'FAILED_VERIFY'
          : 'FAILED_VERIFY'
      return NextResponse.redirect(
        new URL(`/auth/login?message=${encodeURIComponent(code)}`, request.url),
        303,
      )
    }

  if (hasValidVerificationId && verificationId)
    return renderCodeEntryForm(verificationId, callbackURL)

  redirect(`/auth/login?message=${encodeURIComponent('INVALID_TOKEN')}`)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const verificationId = formData.get('verificationId')?.toString()
  const token = formData.get('token')?.toString()
  const rawCallback = formData.get('callbackURL')?.toString()
  const callbackURL = isSafeCallbackUrl(rawCallback ?? null, request.url)

  if (!verificationId || !token || !uuidLike.test(verificationId) || !sixDigitCode.test(token)) {
    const backUrl = verificationId
      ? `/auth/callback/magiclink?verificationId=${encodeURIComponent(verificationId)}&callbackURL=${encodeURIComponent(callbackURL)}&message=${encodeURIComponent('INVALID_CODE')}`
      : `/auth/callback/magiclink?message=${encodeURIComponent('INVALID_CODE')}`
    redirect(backUrl)
  }

  try {
    const response = await client.auth.magiclink.verify({
      body: { verificationId, token },
    })
    const tokens = extractTokens(response)
    if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('FAILED_VERIFY')}`)

    const redirectResponse = NextResponse.redirect(new URL(callbackURL ?? '/', request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    const code =
      error instanceof ApiError
        ? error.status === 401
          ? 'INVALID_TOKEN'
          : 'FAILED_VERIFY'
        : 'FAILED_VERIFY'
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(code)}`, request.url),
      303,
    )
  }
}
