import { ApiError, createClient } from '@repo/core'
import { captureError } from '@repo/error/nextjs/server'
import { logger } from '@repo/utils/logger/server'
import { env } from '@/lib/env'
import { getApiErrorCode } from './api-error'
import { resolveRequestId } from './request-id'

export function createBffClient({
  request,
  headers,
  token,
  getAuthToken,
  getRefreshToken,
  onTokensRefreshed,
  extraHeaders,
}: {
  request?: Request
  headers?: { get: (name: string) => string | null }
  token?: string | null
  getAuthToken?: () => string | null | Promise<string | null>
  getRefreshToken?: () => string | null | Promise<string | null>
  onTokensRefreshed?: (tokens: { token: string; refreshToken: string }) => void | Promise<void>
  extraHeaders?: Record<string, string>
}) {
  const reqId = resolveRequestId(request?.headers ?? headers)
  const getHeaders = () => ({ 'x-request-id': reqId, ...extraHeaders })
  const shared = { baseUrl: env.NEXT_PUBLIC_API_URL, getHeaders }
  const auth = getAuthToken ?? (token ? () => token : undefined)
  const client = auth
    ? createClient({
        ...shared,
        getAuthToken: auth,
        getRefreshToken: getRefreshToken ?? (() => null),
        onTokensRefreshed: onTokensRefreshed ?? (async () => {}),
      })
    : createClient(shared)
  return { reqId, client }
}

export function logAuthBffFailure({
  error,
  reqId,
  method,
}: {
  error: unknown
  reqId: string
  method: string
}) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    logger.warn(
      { reqId, method, code: getApiErrorCode(error) ?? String(error.status) },
      'auth_callback_failed',
    )
    return
  }
  captureError({
    error: error instanceof Error ? error : new Error(String(error)),
    label: `${method} callback`,
    data: { reqId, method, status: error instanceof ApiError ? error.status : undefined },
    tags: { app: 'web', module: 'auth' },
  })
}
