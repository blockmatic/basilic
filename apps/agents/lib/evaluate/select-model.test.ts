import { describe, expect, it } from 'vitest'
import { boardQueryFromMessages, hasSetViewCall, lastUserPrompt } from './select-model.js'

describe('select-model helpers', () => {
  it('skips boardQuery JSON when reading the last user prompt', () => {
    expect(
      lastUserPrompt({
        messages: [
          { role: 'user', content: JSON.stringify({ boardQuery: { universe: 'all' } }) },
          { role: 'user', content: 'what moved?' },
        ],
      }),
    ).toBe('what moved?')
  })

  it('reads boardQuery from client context JSON', () => {
    expect(
      boardQueryFromMessages({
        messages: [{ role: 'user', content: JSON.stringify({ boardQuery: { sortBy: 'volume' } }) }],
      }),
    ).toEqual({ sortBy: 'volume' })
  })

  it('detects a set_view tool result', () => {
    expect(
      hasSetViewCall({
        messages: [{ role: 'tool', content: [{ type: 'tool-result', toolName: 'set_view' }] }],
      }),
    ).toBe(true)
  })
})
