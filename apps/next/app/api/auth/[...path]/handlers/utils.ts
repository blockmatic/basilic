import { env } from '@/lib/env'

export type AuthProxyOptions = {
  pathSegments: string[]
  request: Request
}

export const buildFastifyUrl = ({ pathSegments, request }: AuthProxyOptions) => {
  let path = pathSegments.join('/')
  // Map Next.js API path format to Fastify route format
  // magic-link -> magiclink
  path = path.replace(/magic-link/g, 'magiclink')
  const requestUrl = new URL(request.url)
  return {
    path,
    targetUrl: `${env.NEXT_PUBLIC_API_URL}/auth/${path}${requestUrl.search}`,
  }
}

export const getForwardedHeaders = ({
  request,
  token,
}: Pick<AuthProxyOptions, 'request'> & { token: string | null }) => {
  const requestUrl = new URL(request.url)
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey !== 'host' && lowerKey !== 'cookie') {
      headers.set(key, value)
    }
  })

  headers.set('x-forwarded-host', requestUrl.host)
  headers.set('x-forwarded-proto', requestUrl.protocol.slice(0, -1))
  headers.set('x-forwarded-for', request.headers.get('x-forwarded-for') || requestUrl.hostname)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return { headers }
}

export const getRequestBody = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return { body: undefined }
  }

  return { body: await request.text() }
}

export const getRedirectUrl = ({
  request,
  callbackURL,
}: {
  request: Request
  callbackURL: string | null
}) => {
  if (callbackURL) {
    const url = new URL(callbackURL, new URL(request.url).origin)
    return { redirectUrl: url.toString() }
  }

  const fallbackUrl = new URL('/', new URL(request.url).origin)
  return { redirectUrl: fallbackUrl.toString() }
}
