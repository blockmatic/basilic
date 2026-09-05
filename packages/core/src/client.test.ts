import { createClient, getClientConfig } from './client'

describe('getClientConfig', () => {
  it('returns config when client was created with JWT mode (getAuthToken, getRefreshToken, onTokensRefreshed)', () => {
    const getAuthToken = () => Promise.resolve('token-123')
    const getRefreshToken = () => Promise.resolve('refresh-456')
    const onTokensRefreshed = () => Promise.resolve()
    const client = createClient({
      baseUrl: 'https://api.example.com',
      getAuthToken,
      getRefreshToken,
      onTokensRefreshed,
    })
    const config = getClientConfig(client)
    expect(config).toEqual({
      baseUrl: 'https://api.example.com',
      getAuthToken,
    })
  })

  it('returns config with getAuthToken from apiKey when client was created with apiKey mode', () => {
    const client = createClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'bask_xxx_secret',
    })
    const config = getClientConfig(client)
    expect(config?.baseUrl).toBe('https://api.example.com')
    expect(config?.getAuthToken?.()).toBe('bask_xxx_secret')
  })

  it('returns config without getAuthToken when client was created with no-auth mode', () => {
    const client = createClient({ baseUrl: 'https://api.example.com' })
    const config = getClientConfig(client)
    expect(config).toEqual({
      baseUrl: 'https://api.example.com',
      getAuthToken: undefined,
    })
  })

  it('returns undefined for non-client values', () => {
    expect(getClientConfig(null)).toBeUndefined()
    expect(getClientConfig(undefined)).toBeUndefined()
    expect(getClientConfig({})).toBeUndefined()
  })
})

describe('per-client refresh lock', () => {
  it('isolates concurrent 401 refresh between two clients', async () => {
    let tokenA = 'expired-a'
    let tokenB = 'expired-b'
    const refreshA = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
      tokenA = 'token-a'
      return { token: 'token-a', refreshToken: 'refresh-a' }
    })
    const refreshB = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
      tokenB = 'token-b'
      return { token: 'token-b', refreshToken: 'refresh-b' }
    })

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const req = input instanceof Request ? input : new Request(String(input))
      const auth = req.headers.get('Authorization') ?? ''
      if (req.url.includes('/auth/session/user') && auth.includes('expired'))
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      return new Response(
        JSON.stringify({
          user: {
            id: '1',
            email: 'a@b.c',
            name: null,
            username: 'u',
            emailVerified: true,
            linkedWallets: [],
            linkedAccounts: [],
            passkeys: [],
            hasTotp: false,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const clientA = createClient({
      baseUrl: 'https://api.example.com',
      getAuthToken: () => tokenA,
      getRefreshToken: () => 'refresh-a',
      refreshTokens: refreshA,
      onTokensRefreshed: () => {},
    })
    const clientB = createClient({
      baseUrl: 'https://api.example.com',
      getAuthToken: () => tokenB,
      getRefreshToken: () => 'refresh-b',
      refreshTokens: refreshB,
      onTokensRefreshed: () => {},
    })

    await Promise.all([clientA.auth.session.user(), clientB.auth.session.user()])

    expect(refreshA).toHaveBeenCalled()
    expect(refreshB).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
