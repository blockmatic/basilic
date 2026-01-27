import { beforeEach, describe, expect, it, vi } from 'vitest'

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}))

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
  },
}))

import { clearServerAuthToken, getServerAuthToken, setServerAuthToken } from './auth-server'

describe('auth-server', () => {
  beforeEach(() => {
    cookieStore.get.mockReset()
    cookieStore.set.mockReset()
  })

  it('should return null when no auth cookie is present', async () => {
    cookieStore.get.mockReturnValue(undefined)

    const result = await getServerAuthToken()
    expect(result).toEqual({ token: null })
  })

  it('should return auth token from cookie store', async () => {
    cookieStore.get.mockReturnValue({ value: 'jwt-token' })

    const result = await getServerAuthToken()
    expect(result).toEqual({ token: 'jwt-token' })
  })

  it('should set auth token in HttpOnly cookie', async () => {
    const result = await setServerAuthToken({ token: 'jwt-token' })

    expect(result).toEqual({ token: 'jwt-token' })
    expect(cookieStore.set).toHaveBeenCalledWith('better-auth.jwt_token', 'jwt-token', {
      httpOnly: true,
      maxAge: undefined,
      path: '/',
      sameSite: 'lax',
      secure: false,
    })
  })

  it('should clear auth token cookie', async () => {
    const result = await clearServerAuthToken()

    expect(result).toEqual({ cleared: true })
    expect(cookieStore.set).toHaveBeenCalledWith('better-auth.jwt_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: false,
    })
  })
})
