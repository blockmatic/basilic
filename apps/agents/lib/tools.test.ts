import { readFileSync } from 'node:fs'
import { configureMarkets, fixtureMarkets, getMarkets } from '@repo/markets'
import { describe, expect, it } from 'vitest'

describe('command tools', () => {
  it('get_markets fixture matches getMarkets', async () => {
    configureMarkets({ coinsUseFixture: true })
    expect(await getMarkets({})).toEqual(fixtureMarkets())
  })
})

describe('chat tools', () => {
  it('list_watches source does not call CoinGecko helpers', () => {
    const source = readFileSync(
      new URL('../agents/chat/agent/tools/list_watches.ts', import.meta.url),
      'utf8',
    )
    expect(source).not.toContain('@repo/markets')
    expect(source).not.toContain('getMarkets')
  })
})
