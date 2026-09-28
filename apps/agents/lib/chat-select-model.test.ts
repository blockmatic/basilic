import { describe, expect, it } from 'vitest'
import { formatAccountReply, isAccountAsk } from './chat-select-model.js'

describe('isAccountAsk', () => {
  it('matches who-am-I paraphrases', () => {
    expect(isAccountAsk({ prompt: 'who am I ?' })).toBe(true)
    expect(isAccountAsk({ prompt: 'Who am I?' })).toBe(true)
    expect(isAccountAsk({ prompt: 'whoami' })).toBe(true)
    expect(isAccountAsk({ prompt: "what's my email" })).toBe(true)
    expect(isAccountAsk({ prompt: 'what is my name' })).toBe(true)
    expect(isAccountAsk({ prompt: 'my profile' })).toBe(true)
    expect(isAccountAsk({ prompt: 'signed in as' })).toBe(true)
  })

  it('ignores board questions', () => {
    expect(isAccountAsk({ prompt: 'what moved?' })).toBe(false)
    expect(isAccountAsk({ prompt: 'Reply with the single word ok.' })).toBe(false)
    expect(isAccountAsk({ prompt: 'Who am I watching?' })).toBe(false)
    expect(isAccountAsk({ prompt: 'who am i and what moved' })).toBe(false)
    expect(isAccountAsk({ prompt: 'update my account and show btc' })).toBe(false)
  })
})

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
