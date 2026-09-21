import { getAuthToken, refreshSessionViaNext } from '@/lib/auth/auth-client'

export async function eveAccessToken(): Promise<string> {
  return (await getAuthToken()) ?? (await refreshSessionViaNext())?.token ?? ''
}

export async function eveAuthHeaders(): Promise<{ authorization: string }> {
  return { authorization: `Bearer ${await eveAccessToken()}` }
}

export function isUnauthorizedEveError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error)
    return (error as { status: unknown }).status === 401
  return error instanceof Error && /\b401\b/.test(error.message)
}

export async function sendWithEveRefresh<T>({ run }: { run: () => Promise<T> }): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (!isUnauthorizedEveError(error)) throw error
    if (!(await refreshSessionViaNext())) throw error
    return run()
  }
}
