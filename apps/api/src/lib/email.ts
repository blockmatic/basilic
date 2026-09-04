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

function logEmailSendFailed({
  logger,
  error,
  code,
}: {
  logger: Logger
  error: unknown
  code?: string
}): void {
  const err = toErrField(error instanceof Error ? error : new Error(String(error)))
  logger.error({ err, ...(code ? { code } : {}) }, 'email_send_failed')
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
  let failure: { error: unknown; code?: string } | undefined
  try {
    const result = await provider.emails.send(message)
    if (!result.error) return { resendId: result.data.id }
    failure = { error: new Error(result.error.message), code: result.error.name }
  } catch (error) {
    failure = { error }
  }

  if (!failure) return {}
  logEmailSendFailed({ logger, error: failure.error, code: failure.code })
  if (mode === 'throw')
    throw failure.error instanceof Error ? failure.error : new Error(String(failure.error))
  return {}
}
