import type { CreateEmailOptions } from 'resend'
import type { z } from 'zod'
import type { CreateActivityInput } from './schemas'
import { invoiceSchema, transactionSchema, userSchema } from './schemas'

export interface TeamContext {
  id: string
  name: string
}

export interface NotificationHandler<T = unknown> {
  schema: z.ZodSchema<T>
  email?: {
    template: string
    subject: string
    from?: string
    replyTo?: string
  }
  createActivity: (data: T, user: UserData) => CreateActivityInput
  createEmail?: (
    data: T,
    user: UserData,
    team: TeamContext,
  ) => Partial<Omit<CreateEmailOptions, 'template'>> & {
    data: Record<string, unknown>
    template?: string
    emailType: 'customer' | 'team' | 'owners' // Explicit: customer emails go to external recipients, team emails go to all team members, owners emails go to team owners only
  }
}

export interface UserData {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  team_id: string
  role?: 'owner' | 'member'
}

// Combine template data with all Resend options using intersection type
export type EmailInput = {
  template?: string
  user: UserData
  data: Record<string, unknown>
} & Partial<Omit<CreateEmailOptions, 'template'>>

// Use intersection type to combine our options with Resend's CreateEmailOptions
export type NotificationOptions = {
  priority?: number
  sendEmail?: boolean
} & Partial<CreateEmailOptions>

export interface NotificationResult {
  type: string
  activities: number
  emails: {
    sent: number
    skipped: number
    failed?: number
  }
}

// Re-export schemas from schemas.ts
export { invoiceSchema, transactionSchema, userSchema }
