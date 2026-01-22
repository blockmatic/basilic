import { z } from 'zod'

export const createActivitySchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  type: z.enum(['login_notification', 'transactions_created']),
  source: z.enum(['system', 'user']).default('system'),
  priority: z.number().int().min(1).max(10).default(5),
  groupId: z.string().uuid().optional(), // Links related activities together
  metadata: z.record(z.any(), z.any()), // Flexible - any JSON object
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>

export const userSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().optional(),
  team_id: z.string().uuid(),
  role: z.enum(['owner', 'member']).optional(),
})

export const transactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  category: z.string().optional(),
  status: z.string().optional(),
})

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  amount: z.number(),
  currency: z.string(),
  due_date: z.string(),
  status: z.string(),
})

export const loginNotificationSchema = z.object({
  users: z.array(userSchema),
  timestamp: z.string(), // ISO date string
  ipAddress: z.string(),
  location: z.string().optional(), // e.g., "San Francisco, CA"
  device: z.string().optional(), // e.g., "Chrome on Windows"
  userAgent: z.string().optional(),
})

export const transactionsCreatedSchema = z.object({
  users: z.array(userSchema),
  transactions: z.array(transactionSchema).min(1),
})

export type UserData = z.infer<typeof userSchema>
export type TransactionData = z.infer<typeof transactionSchema>
export type InvoiceData = z.infer<typeof invoiceSchema>
export type LoginNotificationInput = z.infer<typeof loginNotificationSchema>
export type TransactionsCreatedInput = z.infer<typeof transactionsCreatedSchema>

// Notification types map - all available notification types with their data structures
export type NotificationTypes = {
  login_notification: LoginNotificationInput
  transactions_created: TransactionsCreatedInput
}
