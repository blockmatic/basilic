import { logger } from '@repo/utils/logger'
import type {
  EmailInput,
  NotificationHandler,
  NotificationOptions,
  NotificationResult,
  TeamContext,
  UserData,
} from './base'
import type { CreateActivityInput, NotificationTypes } from './schemas'
import { createEmailService } from './services/email-service'
import { loginNotification } from './types/login-notification'
import { transactionsCreated } from './types/transactions-created'

const handlers = {
  login_notification: loginNotification,
  transactions_created: transactionsCreated,
} as const

type CreateEmailInputInput<T extends keyof NotificationTypes> = {
  type: T
  handler: (typeof handlers)[T]
  validatedData: NotificationTypes[T]
  user: UserData
  teamContext: { id: string; name: string }
  options?: NotificationOptions
}

const createEmailInput = <T extends keyof NotificationTypes>({
  type,
  handler,
  validatedData,
  user,
  teamContext,
  options,
}: CreateEmailInputInput<T>): EmailInput => {
  if (!handler.createEmail) {
    throw new Error(`Handler for ${type} does not support email creation`)
  }
  // Type assertion is safe here because handler and validatedData are already matched by generic T
  const customEmail = (
    handler.createEmail as (
      data: NotificationTypes[T],
      user: UserData,
      team: TeamContext,
    ) => ReturnType<NonNullable<NotificationHandler<NotificationTypes[T]>['createEmail']>>
  )(validatedData, user, teamContext)

  const baseEmailInput: EmailInput = {
    user,
    ...customEmail,
  }

  const { priority: _priority, sendEmail: _sendEmail, ...resendOptions } = options || {}
  if (Object.keys(resendOptions).length > 0) {
    Object.assign(baseEmailInput, resendOptions)
  }

  return baseEmailInput
}

type CreateInput<T extends keyof NotificationTypes> = {
  type: T
  payload: NotificationTypes[T]
  options?: NotificationOptions
}

const create = async <T extends keyof NotificationTypes>({
  emailService,
  type,
  payload,
  options,
}: {
  emailService: ReturnType<typeof createEmailService>
} & CreateInput<T>): Promise<NotificationResult> => {
  const handler = handlers[type]

  if (!handler) throw new Error(`Unknown notification type: ${type}`)

  try {
    const validatedData = handler.schema.parse(payload) as NotificationTypes[T]

    let emails = {
      sent: 0,
      skipped: validatedData.users.length,
      failed: 0,
    }

    let activities = 0

    // Create activities if handler supports it
    if (handler.createActivity) {
      const activityInputs: CreateActivityInput[] = []
      for (const user of validatedData.users) {
        try {
          // Type assertion is safe here because handler and validatedData are already matched by generic T
          const activityInput = (
            handler.createActivity as (
              data: NotificationTypes[T],
              user: UserData,
            ) => CreateActivityInput | Promise<CreateActivityInput>
          )(validatedData, user)

          // Await if Promise, otherwise use directly
          const resolvedActivityInput = await Promise.resolve(activityInput)

          // Collect activity input for persistence
          activityInputs.push(resolvedActivityInput)
        } catch (error) {
          logger.error(
            {
              err: error,
              type,
              userId: user.id,
              userEmail: '[redacted]',
              notificationType: type,
            },
            `Failed to create activity for notification ${type} for user ${user.id}`,
          )
        }
      }

      // Persist activities via activity service or collect for return
      // TODO: When activity service is available, use: activityService.bulkCreate(activityInputs)
      // For now, activities are collected but not persisted
      // Counter increments only after successful collection (will be moved after persistence when service is added)
      if (activityInputs.length > 0) {
        // TODO: When persistence is implemented, replace this with:
        // try {
        //   await activityService.bulkCreate(activityInputs)
        //   activities = activityInputs.length
        // } catch (error) {
        //   logger.error({ err: error, type, activityCount: activityInputs.length }, 'Failed to persist activities')
        // }
        activities = activityInputs.length
      }
    }

    const sendEmail = options?.sendEmail ?? false

    if (!sendEmail || !handler.createEmail) {
      return {
        type: type as string,
        activities,
        emails,
      }
    }

    const firstUser = validatedData.users[0]
    if (!firstUser) throw new Error('No users available for email context')

    // TODO: Fetch team name from team service/DAO using firstUser.team_id
    // For now using fallback - team name should be fetched and set here
    const teamContext = {
      id: firstUser.team_id,
      name: 'Your Team', // Fallback - should be fetched from team service
    }

    // Type assertion is safe here because handler and validatedData are already matched by generic T
    const sampleEmail = (
      handler.createEmail as (
        data: NotificationTypes[T],
        user: UserData,
        team: TeamContext,
      ) => ReturnType<NonNullable<NotificationHandler<NotificationTypes[T]>['createEmail']>>
    )(validatedData, firstUser, teamContext)

    if (sampleEmail.emailType === 'customer') {
      const emailInputs = [
        createEmailInput({ type, handler, validatedData, user: firstUser, teamContext, options }),
      ]

      emails = await emailService.sendBulk({
        emails: emailInputs,
        notificationType: type as string,
      })
    } else if (sampleEmail.emailType === 'owners') {
      const ownerUsers = validatedData.users.filter((user: UserData) => user.role === 'owner')

      const emailInputs = ownerUsers.map((user: UserData) =>
        createEmailInput({ type, handler, validatedData, user, teamContext, options }),
      )

      emails = await emailService.sendBulk({
        emails: emailInputs,
        notificationType: type as string,
      })
    } else {
      const emailInputs = validatedData.users.map((user: UserData) =>
        createEmailInput({ type, handler, validatedData, user, teamContext, options }),
      )

      emails = await emailService.sendBulk({
        emails: emailInputs,
        notificationType: type as string,
      })
    }

    return {
      type: type as string,
      activities,
      emails,
    }
  } catch (error) {
    logger.error({ err: error }, `Failed to send notification ${type}`)
    throw error
  }
}

export const createNotifications = (): {
  create: <T extends keyof NotificationTypes>(input: CreateInput<T>) => Promise<NotificationResult>
} => {
  const emailService = createEmailService()

  return {
    create: <T extends keyof NotificationTypes>(input: CreateInput<T>) =>
      create({ emailService, ...input }),
  }
}

// Backward compatibility - export class wrapper for existing code
export class Notifications {
  #service: ReturnType<typeof createNotifications>

  constructor() {
    this.#service = createNotifications()
  }

  async create<T extends keyof NotificationTypes>(
    type: T,
    payload: NotificationTypes[T],
    options?: NotificationOptions,
  ): Promise<NotificationResult> {
    return this.#service.create({ type, payload, options })
  }
}

// Export types and base classes for extending
export type {
  EmailInput,
  NotificationHandler,
  NotificationOptions,
  NotificationResult,
  UserData,
} from './base'
export { invoiceSchema, transactionSchema, userSchema } from './base'
export type { NotificationType } from './notification-types'
// Export notification type definitions and utilities
export {
  allNotificationTypes,
  getAllNotificationTypes,
  getNotificationTypeByType,
  getUserSettingsNotificationTypes,
  shouldShowInSettings,
} from './notification-types'
export type { NotificationTypes } from './schemas'
// Export schemas and types
export {
  loginNotificationSchema,
  transactionsCreatedSchema,
} from './schemas'
