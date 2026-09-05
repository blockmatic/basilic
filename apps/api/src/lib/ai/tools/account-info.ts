import { type ToolSet, tool } from 'ai'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../db/index.js'
import { users } from '../../../db/schema/index.js'
import { env } from '../../env.js'
import { createBraveSearchTool } from './brave-search.js'
import { createMarketSnapshotTool } from './market-snapshot.js'

const userInfoSpecRoot = 'user-info-1'

function buildUserInfoSpec(user: {
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  createdAt: Date
}) {
  const joinedAt = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(user.createdAt)
  return {
    root: userInfoSpecRoot,
    elements: {
      [userInfoSpecRoot]: {
        type: 'UserInfo',
        props: {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          username: user.username ?? null,
          joinedAt,
        },
        children: [],
      },
    },
  } as const
}

function createAccountInfoTool(userId: string) {
  return tool({
    description:
      'Returns information about the current authenticated account. Use when the user asks who they are, their account details, when they joined, or similar.',
    inputSchema: z.object({}),
    execute: async () => {
      const db = await getDb()
      const [user] = await db.select().from(users).where(eq(users.id, userId))
      if (!user) return 'Account not found.'
      const spec = buildUserInfoSpec(user)
      const summaryParts = [`You joined in ${spec.elements[userInfoSpecRoot].props.joinedAt}`]
      if (user.email) summaryParts.push(`Email: ${user.email}`)
      if (user.name) summaryParts.push(`Name: ${user.name}`)
      if (user.username) summaryParts.push(`Username: ${user.username}`)
      return {
        __render: 'user-info',
        spec,
        summary: summaryParts.join('. '),
      }
    },
  })
}

export function getMergedTools(
  userId: string,
  log: import('fastify').FastifyBaseLogger,
  abortSignal?: AbortSignal,
): ToolSet {
  return {
    getAccountInfo: createAccountInfoTool(userId),
    getMarketSnapshot: createMarketSnapshotTool(abortSignal),
    ...(env.BRAVE_SEARCH_API_KEY && {
      braveSearch: createBraveSearchTool(env.BRAVE_SEARCH_API_KEY, log, abortSignal),
    }),
  }
}
