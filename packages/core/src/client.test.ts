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
