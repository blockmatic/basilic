import type { CreateEmailOptions } from 'resend'
import type { z } from 'zod'
import type { CreateActivityInput } from './schemas'
import { invoiceSchema, transactionSchema, userSchema } from './schemas'

/**
 * Team context information for notifications.
 */
export interface TeamContext {
  /** Team ID */
  id: string

  /** Team name */
  name: string
}

/**
 * Handler interface for notification types.
 *
 * Defines the schema, activity creation, and optional email creation for a notification type.
 * Each notification type must implement this interface.
 *
 * @template T - Type of the notification payload data
 */
export interface NotificationHandler<T = unknown> {
  /** Zod schema for validating notification payload */
  schema: z.ZodSchema<T>

  /** Optional email configuration */
  email?: {
    /** Email template identifier */
    template: string

    /** Email subject line */
    subject: string

    /** Optional sender email address */
    from?: string

    /** Optional reply-to email address */
    replyTo?: string
  }

  /**
   * Creates an activity input from notification data and user.
   *
   * @param data - Validated notification payload
   * @param user - User data for the activity
   * @returns Activity input for persistence
   */
  createActivity: (data: T, user: UserData) => CreateActivityInput

  /**
   * Optional function to create email input from notification data.
   *
   * @param data - Validated notification payload
   * @param user - User data for the email recipient
   * @param team - Team context information
   * @returns Email input with template data and Resend options
   */
  createEmail?: (
    data: T,
    user: UserData,
    team: TeamContext,
  ) => Partial<Omit<CreateEmailOptions, 'template'>> & {
    /** Template data for email rendering */
    data: Record<string, unknown>

    /** Optional email template identifier (overrides handler.email.template) */
    template?: string

    /**
     * Email type determines recipient filtering:
     * - 'customer': External recipients (customers)
     * - 'team': All team members
     * - 'owners': Team owners only
     */
    emailType: 'customer' | 'team' | 'owners'
  }
}

/**
 * User data structure for notifications.
 */
export interface UserData {
  /** User ID */
  id: string

  /** User's full name */
  full_name: string

  /** User's email address */
  email: string

  /** Optional user avatar URL */
  avatar_url?: string

  /** Team ID the user belongs to */
  team_id: string

  /** Optional user role within the team */
  role?: 'owner' | 'member'
}

/**
 * Email input combining template data with Resend options.
 *
 * Combines user data, template data, and all Resend email options
 * into a single type for email sending.
 */
export type EmailInput = {
  /** Optional email template identifier */
  template?: string

  /** User data for the email recipient */
  user: UserData

  /** Template data for email rendering */
  data: Record<string, unknown>
} & Partial<Omit<CreateEmailOptions, 'template'>>

/**
 * Notification options combining custom options with Resend options.
 *
 * Includes notification-specific options (priority, sendEmail) and
 * all Resend email options for flexible email configuration.
 */
export type NotificationOptions = {
  /** Optional email priority (Resend feature) */
  priority?: number

  /** Whether to send emails (default: false) */
  sendEmail?: boolean
} & Partial<CreateEmailOptions>

/**
 * Result of a notification creation operation.
 */
export interface NotificationResult {
  /** Notification type that was created */
  type: string

  /** Number of activities created */
  activities: number

  /** Email sending statistics */
  emails: {
    /** Number of emails successfully sent */
    sent: number

    /** Number of emails skipped (not sent) */
    skipped: number

    /** Number of emails that failed to send */
    failed?: number
  }
}

// Re-export schemas from schemas.ts
export { invoiceSchema, transactionSchema, userSchema }
