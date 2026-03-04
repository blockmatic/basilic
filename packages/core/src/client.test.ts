import { createClient, getClientConfig } from './client'

describe('getClientConfig', () => {
  it('returns config when client was created with getAuthToken and baseUrl', () => {
    const getAuthToken = () => Promise.resolve('token-123')
    const client = createClient({
      baseUrl: 'https://api.example.com',
      getAuthToken,
    })
    const config = getClientConfig(client)
    expect(config).toEqual({
      baseUrl: 'https://api.example.com',
      getAuthToken,
    })
  })

  it('returns config without getAuthToken when client was created without it', () => {
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
