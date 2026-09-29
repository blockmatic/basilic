import { describe, expect, it } from 'vitest'
import { isAccountAsk, isAccountScopedAsk, userIdFromAuth } from './account-scope.js'

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

describe('isAccountScopedAsk', () => {
  it('matches personal account and portfolio phrasing', () => {
    expect(isAccountScopedAsk({ prompt: 'What are my gains?' })).toBe(true)
    expect(isAccountScopedAsk({ prompt: 'show my portfolio' })).toBe(true)
    expect(isAccountScopedAsk({ prompt: 'my favorites' })).toBe(true)
    expect(isAccountScopedAsk({ prompt: 'my positions' })).toBe(true)
    expect(isAccountScopedAsk({ prompt: 'what is on my list' })).toBe(true)
    expect(isAccountScopedAsk({ prompt: 'who am I' })).toBe(true)
  })

  it('keeps public market prompts public', () => {
    expect(isAccountScopedAsk({ prompt: 'what moved?' })).toBe(false)
    expect(isAccountScopedAsk({ prompt: 'top gainers' })).toBe(false)
    expect(isAccountScopedAsk({ prompt: 'sort by volume' })).toBe(false)
    expect(isAccountScopedAsk({ prompt: 'only majors' })).toBe(false)
  })
})

describe('userIdFromAuth', () => {
  it('returns a user principal id', () => {
    expect(
      userIdFromAuth({
        ctx: { session: { auth: { current: { principalId: 'user-a', principalType: 'user' } } } },
      }),
    ).toBe('user-a')
  })

  it('rejects anonymous and missing principals', () => {
    expect(
      userIdFromAuth({
        ctx: {
          session: { auth: { current: { principalId: 'anonymous', principalType: 'anonymous' } } },
        },
      }),
    ).toBeNull()
    expect(userIdFromAuth({ ctx: {} })).toBeNull()
  })
})
