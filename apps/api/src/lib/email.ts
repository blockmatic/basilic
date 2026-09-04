import { type Logger, toErrField } from '@repo/utils/logger/types'

/** Trim and lowercase email for consistent lookup and storage. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type EmailProvider = {
  emails: {
    send: (options: {
      from: string
      to: string
      subject: string
      html: string
      text?: string
    }) => Promise<
      | { data: { id: string }; error: null }
      | { data: null; error: { message: string; name?: string } }
    >
  }
}

declare global {
  var __testEmailProvider: EmailProvider | null | undefined
}

/**
 * Set the email provider for tests.
 * Used by the email plugin to provide a test email provider instead of Resend.
 */
export function setTestEmailProvider(provider: EmailProvider | null): void {
  if (typeof globalThis !== 'undefined') globalThis.__testEmailProvider = provider
}

export type SendMailMessage = {
  from: string
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendMail({
  provider,
  message,
  logger,
  mode,
}: {
  provider: EmailProvider
  message: SendMailMessage
  logger: Logger
  mode: 'throw' | 'fireAndForget'
}): Promise<{ resendId?: string }> {
  try {
    const result = await provider.emails.send(message)
    if (result.error) {
      const error = new Error(result.error.message)
      if (mode === 'fireAndForget') {
        logger.error(
          { err: toErrField(error), ...(result.error.name ? { code: result.error.name } : {}) },
          'email_send_failed',
        )
        return {}
      }
      throw error
    }
    return { resendId: result.data.id }
  } catch (error) {
    if (mode === 'throw') throw error
    logger.error(
      {
        err: toErrField(error instanceof Error ? error : new Error(String(error))),
      },
      'email_send_failed',
    )
    return {}
  }
}
