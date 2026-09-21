import { describe, expect, it } from 'vitest'
import { serializeBoardUrl } from './board-url'

describe('serializeBoardUrl', () => {
  it('omits default table chrome and keeps shareable filters', () => {
    expect(
      serializeBoardUrl('/', {
        sortBy: 'change24h',
        sortDir: 'desc',
        sidebar: 'close',
        q: 'What moved?',
      }),
    ).toBe('/?sortBy=change24h&sortDir=desc&sidebar=close&q=What+moved?')
  })

  it('keeps rail and columns on the query string', () => {
    expect(
      serializeBoardUrl('/', {
        rail: 'chat',
        columns: ['identity', 'price'],
        period: '7d',
      }),
    ).toBe('/?period=7d&columns=identity,price&rail=chat')
  })
})
