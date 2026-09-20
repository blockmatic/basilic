import { describe, expect, it } from 'vitest'
import { negotiateAccept } from './negotiate.js'

describe('negotiateAccept', () => {
  it('defaults missing Accept to html', () => {
    expect(negotiateAccept({})).toBe('html')
    expect(negotiateAccept({ acceptHeader: '' })).toBe('html')
  })

  it('maps */* and text/html to html', () => {
    expect(negotiateAccept({ acceptHeader: '*/*' })).toBe('html')
    expect(negotiateAccept({ acceptHeader: 'text/html' })).toBe('html')
  })

  it('maps markdown types', () => {
    expect(negotiateAccept({ acceptHeader: 'text/markdown' })).toBe('markdown')
    expect(negotiateAccept({ acceptHeader: 'text/x-markdown' })).toBe('markdown')
  })

  it('maps application/json', () => {
    expect(negotiateAccept({ acceptHeader: 'application/json' })).toBe('json')
  })

  it('picks the highest q', () => {
    expect(negotiateAccept({ acceptHeader: 'text/html, text/markdown;q=0.8' })).toBe('html')
    expect(negotiateAccept({ acceptHeader: 'text/markdown, text/html;q=0.9' })).toBe('markdown')
  })

  it('returns none when nothing matches', () => {
    expect(negotiateAccept({ acceptHeader: 'image/png' })).toBe('none')
  })
})
