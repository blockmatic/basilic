import { readdirSync, readFileSync } from 'node:fs'
import { configureMarkets, fixtureMarkets, getMarkets } from '@repo/markets'
import { describe, expect, it } from 'vitest'

describe('command tools', () => {
  it('get_markets fixture matches getMarkets', async () => {
    configureMarkets({ coinsUseFixture: true })
    expect(await getMarkets({})).toEqual(fixtureMarkets())
  })
})

describe('chat tools', () => {
  it('sources do not call markets, Alchemy, or drizzle schema', () => {
    const dir = new URL('../agents/chat/agent/tools/', import.meta.url)
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.ts')) continue
      const source = readFileSync(new URL(name, dir), 'utf8')
      expect(source, name).not.toContain('@repo/markets')
      expect(source, name).not.toContain('getMarkets')
      expect(source, name).not.toContain('@repo/onchain')
      expect(source, name).not.toContain('Alchemy')
      expect(source, name).not.toContain('@repo/db/schema')
    }
  })
})
