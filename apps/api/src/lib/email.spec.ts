import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMail } from './email.js'

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
}

describe('sendMail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns resendId and does not log on success', async () => {
    const provider = {
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: 're_123' }, error: null }),
      },
    }
    const result = await sendMail({
      provider,
      logger,
      mode: 'throw',
      message: { from: 'a@b.c', to: 'u@x.y', subject: 's', html: '<p>x</p>' },
    })
    expect(result).toEqual({ resendId: 're_123' })
    expect(logger.error).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalled()
  })

  it('logs email_send_failed then throws on provider error in throw mode', async () => {
    const provider = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'bounce', name: 'validation_error' },
        }),
      },
    }
    await expect(
      sendMail({
        provider,
        logger,
        mode: 'throw',
        message: { from: 'a@b.c', to: 'u@x.y', subject: 's', html: '<p>x</p>' },
      }),
    ).rejects.toThrow('bounce')
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'validation_error' }),
      'email_send_failed',
    )
    const payload = logger.error.mock.calls[0]?.[0] as { err?: { message?: string } }
    expect(JSON.stringify(payload)).not.toContain('u@x.y')
  })

  it('logs email_send_failed then throws when the provider rejects in throw mode', async () => {
    const provider = {
      emails: {
        send: vi.fn().mockRejectedValue(new Error('network down')),
      },
    }
    await expect(
      sendMail({
        provider,
        logger,
        mode: 'throw',
        message: { from: 'a@b.c', to: 'u@x.y', subject: 's', html: '<p>x</p>' },
      }),
    ).rejects.toThrow('network down')
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.objectContaining({ message: 'network down' }) }),
      'email_send_failed',
    )
    const payload = logger.error.mock.calls[0]?.[0] as { err?: { message?: string } }
    expect(JSON.stringify(payload)).not.toContain('u@x.y')
  })

  it('logs email_send_failed in fireAndForget mode', async () => {
    const provider = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'timeout', name: 'application_error' },
        }),
      },
    }
    const result = await sendMail({
      provider,
      logger,
      mode: 'fireAndForget',
      message: { from: 'a@b.c', to: 'u@x.y', subject: 's', html: '<p>x</p>' },
    })
    expect(result).toEqual({})
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'application_error' }),
      'email_send_failed',
    )
    const payload = logger.error.mock.calls[0]?.[0] as { err?: { message?: string } }
    expect(JSON.stringify(payload)).not.toContain('u@x.y')
  })
})
