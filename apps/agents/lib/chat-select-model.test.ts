import { describe, expect, it } from 'vitest'
import { formatAccountReply } from './chat-select-model.js'

describe('formatAccountReply', () => {
  it('lists populated fields', () => {
    expect(
      formatAccountReply({
        account: {
          name: 'Ada',
          email: 'ada@test.ai',
          image: null,
          username: 'ada',
          joinedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    ).toBe('Name: Ada\nUsername: ada\nEmail: ada@test.ai\nJoined: 2026-01-01T00:00:00.000Z')
  })

  it('handles a missing row', () => {
    expect(formatAccountReply({ account: null })).toBe(
      'No profile row is stored for this signed-in user.',
    )
  })
})
