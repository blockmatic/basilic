import { describe, expect, it, vi } from 'vitest'
import { createClientLogger } from './client.js'
import { normalizeLogArgs, toErrField } from './normalize.js'
import { pathOnlyUrl, pinoRedactPaths, sanitizeLogData } from './redact.js'
import { parseBool } from './types.js'

describe('parseBool', () => {
  it('parses truthy strings', () => {
    expect(parseBool('1', false)).toBe(true)
    expect(parseBool('true', false)).toBe(true)
    expect(parseBool('YES', false)).toBe(true)
    expect(parseBool('on', false)).toBe(true)
  })

  it('does not treat "false" as true', () => {
    expect(parseBool('false', true)).toBe(false)
    expect(parseBool('0', true)).toBe(false)
  })

  it('uses fallback when unset', () => {
    expect(parseBool(undefined, true)).toBe(true)
    expect(parseBool(undefined, false)).toBe(false)
  })
})

describe('normalizeLogArgs', () => {
  it('treats a lone string as the message', () => {
    expect(normalizeLogArgs('hello')).toEqual({ msg: 'hello' })
  })

  it('passes through (data, message)', () => {
    expect(normalizeLogArgs({ userId: '1' }, 'ok')).toEqual({
      obj: { userId: '1' },
      msg: 'ok',
    })
  })

  it('normalizes Error into err', () => {
    const err = new Error('boom')
    const result = normalizeLogArgs(err, 'failed')
    expect(result.msg).toBe('failed')
    expect(result.obj?.err).toMatchObject({ type: 'Error', message: 'boom' })
  })

  it('uses error message when msg is omitted', () => {
    expect(normalizeLogArgs(new Error('boom')).msg).toBe('boom')
  })

  it('wraps primitives in data', () => {
    expect(normalizeLogArgs(42, 'n')).toEqual({ obj: { data: 42 }, msg: 'n' })
  })
})

describe('toErrField', () => {
  it('includes type and message', () => {
    expect(toErrField(new TypeError('x'))).toMatchObject({ type: 'TypeError', message: 'x' })
  })
})

describe('pathOnlyUrl', () => {
  it('strips query and hash from paths', () => {
    expect(pathOnlyUrl('/auth/callback?token=secret#x')).toBe('/auth/callback')
  })

  it('strips query from absolute urls', () => {
    expect(pathOnlyUrl('https://example.com/login?code=abc')).toBe('/login')
  })
})

describe('sanitizeLogData', () => {
  it('redacts top-level sensitive keys', () => {
    expect(sanitizeLogData({ token: 'abc', userId: '1' })).toEqual({
      token: '[REDACTED]',
      userId: '1',
    })
  })

  it('redacts nested token, email, and prompt keys', () => {
    expect(
      sanitizeLogData({
        user: { token: 'abc', email: 'a@b.c', profile: { prompt: 'secret' } },
        items: [{ token: 't' }, { email: 'n@x.y' }, { prompt: 'p' }],
        userId: '1',
      }),
    ).toEqual({
      user: { token: '[REDACTED]', email: '[REDACTED]', profile: { prompt: '[REDACTED]' } },
      items: [{ token: '[REDACTED]' }, { email: '[REDACTED]' }, { prompt: '[REDACTED]' }],
      userId: '1',
    })
  })

  it('preserves nested non-sensitive values', () => {
    expect(sanitizeLogData({ nested: { userId: '1', count: 2 } })).toEqual({
      nested: { userId: '1', count: 2 },
    })
  })

  it('does not redact catalog code', () => {
    expect(sanitizeLogData({ code: 'INVALID_TOKEN' })).toEqual({ code: 'INVALID_TOKEN' })
  })

  it('returns a stable placeholder for cyclic object graphs', () => {
    const root: Record<string, unknown> = { userId: '1' }
    root.self = root
    expect(sanitizeLogData(root)).toEqual({ userId: '1', self: '[Circular]' })
  })

  it('sanitizes shared non-cyclic references on each path', () => {
    const shared = { token: 'secret' }
    expect(sanitizeLogData({ a: shared, b: shared })).toEqual({
      a: { token: '[REDACTED]' },
      b: { token: '[REDACTED]' },
    })
  })
})

describe('pinoRedactPaths', () => {
  it('includes authorization header and token globs', () => {
    expect(pinoRedactPaths).toContain('req.headers.authorization')
    expect(pinoRedactPaths).toContain('*.token')
  })
})

describe('createClientLogger', () => {
  it('emits production errors when logging is otherwise disabled', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const logger = createClientLogger({ NODE_ENV: 'production' })
    logger.info('quiet')
    logger.error(new Error('boom'), 'failed')
    expect(infoSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
    const [, obj] = errorSpy.mock.calls[0] as [string, { err: { message: string } }]
    expect(obj.err.message).toBe('boom')
    errorSpy.mockRestore()
    infoSpy.mockRestore()
  })

  it('stays silent when level is explicitly silent', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = createClientLogger({
      NODE_ENV: 'production',
      NEXT_PUBLIC_LOG_LEVEL: 'silent',
    })
    logger.error('failed')
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('stays silent in test by default', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = createClientLogger({ NODE_ENV: 'test', VITEST: 'true' })
    logger.error('failed')
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
