import LoginNotificationEmail from '@repo/email/emails/login-notification'
import MagicLinkLoginEmail from '@repo/email/emails/magic-link-login'
import TransactionsEmail from '@repo/email/emails/transactions'
import WelcomeEmail from '@repo/email/emails/welcome'
import { render } from '@repo/email/render'
import { logger } from '@repo/utils/logger'
import { nanoid } from 'nanoid'
import type { ComponentProps, ReactNode } from 'react'
import { type CreateEmailOptions, Resend } from 'resend'
import type { EmailInput } from '../base'
import { env } from '../env'

// Extract prop types from email components
type MagicLinkLoginProps = ComponentProps<typeof MagicLinkLoginEmail>
type LoginNotificationProps = ComponentProps<typeof LoginNotificationEmail>
type WelcomeProps = ComponentProps<typeof WelcomeEmail>
type TransactionsProps = ComponentProps<typeof TransactionsEmail>

// Map template names to their prop types
type TemplatePropsMap = {
  'magic-link-login': MagicLinkLoginProps
  'login-notification': LoginNotificationProps
  welcome: WelcomeProps
  transactions: TransactionsProps
}

type TemplateName = keyof TemplatePropsMap

type SendBulkResult = {
  sent: number
  skipped: number
  failed: number
}

type SendBulkInput = {
  emails: EmailInput[]
  notificationType: string
}

const getTemplate = <T extends TemplateName>(
  templateName: T,
): ((props: TemplatePropsMap[T]) => ReactNode) => {
  switch (templateName) {
    case 'magic-link-login':
      return MagicLinkLoginEmail as (props: TemplatePropsMap[T]) => ReactNode
    case 'login-notification':
      return LoginNotificationEmail as (props: TemplatePropsMap[T]) => ReactNode
    case 'welcome':
      return WelcomeEmail as (props: TemplatePropsMap[T]) => ReactNode
    case 'transactions':
      return TransactionsEmail as (props: TemplatePropsMap[T]) => ReactNode
    default:
      throw new Error(`Unknown email template: ${templateName}`)
  }
}

const buildEmailPayload = async ({ email }: { email: EmailInput }): Promise<CreateEmailOptions> => {
  if (!email.template) throw new Error(`No template found for email: ${email.template}`)
  if (!email.subject) throw new Error(`No subject found for email: ${email.template}`)

  const templateName = email.template as TemplateName
  const template = getTemplate(templateName)
  const html = await render(template(email.data as TemplatePropsMap[typeof templateName]))

  const recipients = email.to || [email.user.email]

  const fromAddress = email.from || env.EMAIL_FROM
  if (!fromAddress) {
    throw new Error(
      'Email "from" address is required. Set EMAIL_FROM environment variable or provide email.from',
    )
  }

  const payload: CreateEmailOptions = {
    from: fromAddress,
    to: recipients,
    subject: email.subject,
    html,
    headers: {
      'X-Entity-Ref-ID': nanoid(),
      ...email.headers,
    },
  }

  if (email.replyTo) payload.replyTo = email.replyTo
  if (email.cc) payload.cc = email.cc
  if (email.bcc) payload.bcc = email.bcc
  if (email.attachments) payload.attachments = email.attachments
  if (email.tags) payload.tags = email.tags
  if (email.text) payload.text = email.text

  return payload
}

const sendEmailIndividually = async ({
  client,
  payload,
}: {
  client: Resend
  payload: CreateEmailOptions
}): Promise<boolean> => {
  try {
    const response = await client.emails.send(payload)
    if (response.error) {
      logger.error({ err: response.error }, 'Failed to send email')
      return false
    }
    return true
  } catch (error) {
    logger.error({ err: error }, 'Failed to send email')
    return false
  }
}

const sendBulk = async ({
  client,
  emails,
  notificationType: _notificationType,
}: {
  client: Resend
} & SendBulkInput): Promise<SendBulkResult> => {
  if (emails.length === 0) return { sent: 0, skipped: 0, failed: 0 }

  const emailPayloads = await Promise.all(emails.map(email => buildEmailPayload({ email })))

  const hasAttachments = emailPayloads.some(
    payload => payload.attachments && payload.attachments.length > 0,
  )

  try {
    if (hasAttachments) {
      let sent = 0
      let failed = 0

      for (const payload of emailPayloads) {
        const success = await sendEmailIndividually({ client, payload })
        if (success) sent++
        else failed++
      }

      return { sent, skipped: 0, failed }
    }

    const response = await client.batch.send(emailPayloads)

    if (response.error) {
      logger.error({ err: response.error }, 'Failed to send emails')
      return { sent: 0, skipped: 0, failed: emailPayloads.length }
    }

    // Check for per-email errors in response.data.errors (permissive validation mode)
    if (
      response.data &&
      typeof response.data === 'object' &&
      'errors' in response.data &&
      Array.isArray(response.data.errors)
    ) {
      const errors = response.data.errors as unknown[]
      const failed = errors.length
      const sent = emailPayloads.length - failed
      logger.error(
        { errors },
        `Batch send completed with ${failed} failures out of ${emailPayloads.length} emails`,
      )
      return { sent, skipped: 0, failed }
    }

    return { sent: emailPayloads.length, skipped: 0, failed: 0 }
  } catch (error) {
    logger.error({ err: error }, 'Failed to send emails')
    return { sent: 0, skipped: 0, failed: emails.length }
  }
}

export const createEmailService = (): {
  sendBulk: (input: SendBulkInput) => Promise<SendBulkResult>
} => {
  const client = new Resend(env.RESEND_API_KEY)

  return {
    sendBulk: (input: SendBulkInput) => sendBulk({ client, ...input }),
  }
}

// Backward compatibility - export class wrapper for existing code
export class EmailService {
  #service: ReturnType<typeof createEmailService>

  constructor() {
    this.#service = createEmailService()
  }

  async sendBulk(emails: EmailInput[], notificationType: string): Promise<SendBulkResult> {
    return this.#service.sendBulk({ emails, notificationType })
  }
}
