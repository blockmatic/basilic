import type { NotificationHandler } from '../base'
import type { TransactionsCreatedInput } from '../schemas'
import { transactionsCreatedSchema } from '../schemas'

export const transactionsCreated: NotificationHandler<TransactionsCreatedInput> = {
  schema: transactionsCreatedSchema,

  createActivity: (data, user) => {
    const firstTransaction = data.transactions[0]
    const lastTransaction = data.transactions[data.transactions.length - 1]

    return {
      teamId: user.team_id,
      userId: user.id,
      type: 'transactions_created',
      source: 'system',
      priority: 3,
      metadata: {
        count: data.transactions.length,
        dateRange: {
          from: lastTransaction?.date,
          to: firstTransaction?.date,
        },
        // For single transactions, store the transaction details for richer notifications
        ...(data.transactions.length === 1 &&
          firstTransaction && {
            recordId: firstTransaction.id,
            transaction: {
              name: firstTransaction.name,
              amount: firstTransaction.amount,
              currency: firstTransaction.currency,
              date: firstTransaction.date,
            },
          }),
      },
    }
  },

  createEmail: (data, user, team) => {
    return {
      template: 'transactions',
      emailType: 'owners',
      subject: 'New transactions',
      data: {
        transactions: data.transactions,
        teamName: team.name,
        fullName: user.full_name,
      },
    }
  },
}
