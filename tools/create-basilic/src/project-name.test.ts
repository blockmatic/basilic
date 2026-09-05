import { describe, expect, it } from 'vitest'
import { parseProjectName, ValidationError } from './project-name.js'

describe('parseProjectName', () => {
  it('slugifies directories with spaces', () => {
    expect(parseProjectName({ directory: '/tmp/My App' })).toEqual({
      slug: 'my-app',
      displayName: 'My App',
      packageName: 'my-app',
    })
  })

  it('accepts dotted names', () => {
    expect(parseProjectName({ directory: 'acme.app' }).packageName).toBe('acme.app')
  })

  it('rejects empty names', () => {
    expect(() => parseProjectName({ directory: '   ' })).toThrow(ValidationError)
  })

  it('rejects names that sanitize to empty', () => {
    expect(() => parseProjectName({ directory: '!!!' })).toThrow(ValidationError)
  })

  it('rejects a leading-dot basename', () => {
    expect(() => parseProjectName({ directory: '.hidden' })).toThrow(ValidationError)
  })
})
