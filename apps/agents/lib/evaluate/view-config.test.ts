import { describe, expect, it } from 'vitest'
import { defaultSearchQuery, parseViewConfig, viewFromSearchQuery } from './view-config.js'

describe('viewConfigSchema', () => {
  it('parses the closed whoami board shape', () => {
    expect(
      parseViewConfig({
        value: viewFromSearchQuery({
          query: { ...defaultSearchQuery, universe: 'watchlist' },
          title: 'Your profile',
          surface: 'account',
        }),
      }),
    ).toMatchObject({ version: 1, surface: 'account' })
  })
})
