import { describe, expect, it } from 'vitest'
import { composeSurface } from './compose'
import { specFromSelection } from './spec-from-selection'
import { defaultSearchQuery, viewFromSearchQuery } from './view-config'

function tableElement(spec: ReturnType<typeof composeSurface>) {
  return Object.values(spec.elements).find(element => element.type === 'DataTable')
}

describe('composeSurface', () => {
  it('binds the default table to $state.coins without spec repeat', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({ query: defaultSearchQuery, title: 'Top coins' }),
    })
    const table = tableElement(spec)
    expect(spec.root).toBe('board')
    expect(table?.repeat).toBeUndefined()
    expect(table?.children).toEqual([])
    expect(table?.props).toMatchObject({
      columns: ['rank', 'identity', 'price', 'change24h', 'marketCap', 'volume', 'watch'],
    })
  })

  it('keeps a DataTable and honesty string for reserved chart', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({
        query: defaultSearchQuery,
        title: 'Top coins',
        surface: 'chart',
      }),
    })
    expect(tableElement(spec)?.repeat).toBeUndefined()
    expect(JSON.stringify(spec)).toContain('Charting lands next.')
  })

  it('uses movers columns when sortBy is change24h', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({
        query: { ...defaultSearchQuery, sortBy: 'change24h' },
        title: 'What moved?',
      }),
    })
    expect(tableElement(spec)?.props).toMatchObject({
      columns: ['identity', 'price', 'change24h', 'volume', 'watch'],
    })
  })

  it('uses comparison columns for few symbols', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({
        query: { ...defaultSearchQuery, symbols: ['btc', 'eth'] },
        title: 'BTC vs ETH',
        surface: 'comparison',
      }),
    })
    expect(tableElement(spec)?.props).toMatchObject({
      columns: ['identity', 'price', 'change24h', 'marketCap', 'watch'],
    })
  })

  it('includes QuerySummary and DataTable for screener', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({
        query: { ...defaultSearchQuery, universe: 'majors' },
        title: 'Majors',
        surface: 'screener',
      }),
    })
    expect(Object.values(spec.elements).some(element => element.type === 'QuerySummary')).toBe(true)
    expect(tableElement(spec)?.type).toBe('DataTable')
  })

  it('paints account as UserInfo plus an empty-safe DataTable', () => {
    const spec = composeSurface({
      view: viewFromSearchQuery({
        query: defaultSearchQuery,
        title: 'Account',
        surface: 'account',
      }),
    })
    const userInfo = Object.values(spec.elements).find(element => element.type === 'UserInfo')
    expect(userInfo?.props).toMatchObject({
      name: { $state: '/account/name' },
      email: { $state: '/account/email' },
      image: { $state: '/account/image' },
      username: { $state: '/account/username' },
      joinedAt: { $state: '/account/joinedAt' },
    })
    expect(tableElement(spec)?.repeat).toBeUndefined()
    expect(JSON.stringify(spec)).toContain('Your profile. Favorites below.')
  })

  it('drops unknown column ids and keeps the allowlist subset', () => {
    const spec = composeSurface({
      view: {
        ...viewFromSearchQuery({ query: defaultSearchQuery, title: 'Custom' }),
        columns: ['identity', 'nope', 'price'],
      },
    })
    expect(tableElement(spec)?.props).toMatchObject({ columns: ['identity', 'price'] })
  })

  it('returns the same spec shape for the same query twice', () => {
    const view = viewFromSearchQuery({
      query: { ...defaultSearchQuery, sortBy: 'change24h' },
      title: 'What moved?',
      columns: ['identity', 'price'],
    })
    expect(composeSurface({ view })).toEqual(composeSurface({ view }))
  })
})

describe('specFromSelection', () => {
  const view = viewFromSearchQuery({
    query: { ...defaultSearchQuery, sortBy: 'change24h' },
    title: 'What moved?',
  })

  it('rebuilds the same spec shape from the same elements', () => {
    const elements = ['summary', 'table-movers']
    expect(specFromSelection({ elements, view })).toEqual(specFromSelection({ elements, view }))
    expect(tableElement(specFromSelection({ elements, view }))?.props).toMatchObject({
      columns: ['identity', 'price', 'change24h', 'volume', 'watch'],
    })
  })

  it('falls back to composeSurface for empty or unknown ids', () => {
    expect(specFromSelection({ elements: [], view })).toEqual(composeSurface({ view }))
    expect(specFromSelection({ elements: ['nope'], view })).toEqual(composeSurface({ view }))
  })

  it('falls back when the selection has no DataTable recipe', () => {
    expect(specFromSelection({ elements: ['summary', 'account'], view })).toEqual(
      composeSurface({ view }),
    )
  })
})
