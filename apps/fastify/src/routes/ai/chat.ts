import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import {
  convertToModelMessages,
  generateText,
  type ModelMessage,
  smoothStream,
  streamText,
  type ToolSet,
  tool,
} from 'ai'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { getDb } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema } from '../schemas.js'
import { createBraveSearchTool } from './brave-search.js'
import { defaultOpenRouterModel, getProvider, getResolvedProvider } from './provider.js'

const ChatMessageItemSchema = Type.Union([
  Type.Object({
    role: Type.String(),
    content: Type.String(),
    name: Type.Optional(Type.String()),
  }),
  Type.Object({
    role: Type.String(),
    parts: Type.Array(Type.Any()),
  }),
])

const ChatRequestSchema = Type.Object({
  messages: Type.Array(ChatMessageItemSchema, { minItems: 1, maxItems: 50 }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String({ default: defaultOpenRouterModel })),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
  tools: Type.Optional(Type.Any()),
})

const ChatResponseSchema = Type.Object({
  text: Type.String(),
})

function isUIMessage(msg: unknown): msg is { role: string; parts: unknown[] } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'parts' in msg &&
    Array.isArray((msg as { parts?: unknown[] }).parts)
  )
}

function isCoreMessage(msg: unknown): msg is { role: string; content: string } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'content' in msg &&
    typeof (msg as { content?: unknown }).content === 'string' &&
    'role' in msg
  )
}

async function resolveMessages(rawMessages: unknown[], tools: ToolSet): Promise<ModelMessage[]> {
  const first = rawMessages[0]
  if (isUIMessage(first)) {
    const allUIMessage = rawMessages.every(isUIMessage)
    if (!allUIMessage) throw new Error('Invalid request: mixed UIMessage and CoreMessage formats')

    return convertToModelMessages(rawMessages as Parameters<typeof convertToModelMessages>[0], {
      tools,
      ignoreIncompleteToolCalls: true,
    })
  }
  if (isCoreMessage(first)) {
    const allCore = rawMessages.every(isCoreMessage)
    if (!allCore) throw new Error('Invalid request: mixed UIMessage and CoreMessage formats')

    return rawMessages as ModelMessage[]
  }
  throw new Error(
    'Invalid request: each message must have parts (UIMessage) or content (CoreMessage)',
  )
}

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

function getMergedTools(userId: string, log: import('fastify').FastifyBaseLogger): ToolSet {
  return {
    getAccountInfo: createAccountInfoTool(userId),
    ...(env.BRAVE_SEARCH_API_KEY && {
      braveSearch: createBraveSearchTool(env.BRAVE_SEARCH_API_KEY, log),
    }),
  }
}

const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description:
          'Chat with AI via Open Router (default) or Ollama. Set OPEN_ROUTER_API_KEY or OLLAMA_BASE_URL. Default model configurable via AI_DEFAULT_MODEL. Supports streaming and tools.',
        summary: 'Generate AI chat response',
        tags: ['ai'],
        security: [{ bearerAuth: [] }],
        body: ChatRequestSchema,
        response: {
          200: Type.Union([
            ChatResponseSchema,
            Type.String({ description: 'Streaming text response' }),
          ]),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = request.session
      if (!session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const provider = getResolvedProvider()
      if (!provider)
        return reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No AI provider configured. Set OPEN_ROUTER_API_KEY or OLLAMA_BASE_URL.',
        })

      const { messages: rawMessages, stream, model, temperature } = request.body
      const resolvedModel = getProvider(provider, model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      const mergedTools = getMergedTools(session.user.id, request.log)

      let messages: Awaited<ReturnType<typeof resolveMessages>>
      try {
        messages = await resolveMessages(rawMessages as unknown[], mergedTools)
      } catch (err) {
        return reply.code(400).send({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Invalid message format',
        })
      }

      const startMs = Date.now()
      request.log.debug(
        { messages: messages.length, model, stream: shouldStream, temperature },
        'Processing chat request',
      )

      const abortSignal = AbortSignal.timeout(env.AI_UPSTREAM_TIMEOUT_MS)
      const baseOptions = {
        model: resolvedModel,
        messages,
        tools: mergedTools,
        abortSignal,
        ...(temperature !== undefined && { temperature }),
      }

      try {
        if (shouldStream) {
          const result = streamText({
            ...baseOptions,
            experimental_transform: smoothStream({
              delayInMs: 15,
              chunking: 'word',
            }),
          })
          const response = result.toUIMessageStreamResponse()
          for (const [k, v] of response.headers) reply.raw.setHeader(k, v)
          reply.raw.statusCode = response.status
          request.log.info(
            {
              route: '/ai/chat',
              provider,
              model: request.body.model ?? 'default',
              stream: true,
              durationMs: Date.now() - startMs,
              userId: session.user.id.slice(0, 8),
            },
            'Chat stream started',
          )
          return reply.send(response.body as never)
        }

        const result = await generateText(baseOptions)
        request.log.info(
          {
            route: '/ai/chat',
            provider,
            model: request.body.model ?? 'default',
            stream: false,
            durationMs: Date.now() - startMs,
            userId: session.user.id.slice(0, 8),
          },
          'Chat completed',
        )
        return reply.code(200).send({ text: result.text })
      } catch (err) {
        request.log.warn(
          {
            route: '/ai/chat',
            provider,
            error: err instanceof Error ? err.message : String(err),
            durationMs: Date.now() - startMs,
          },
          'Chat upstream error',
        )
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'AI provider request failed. Try again later.',
        })
      }
    },
  )
}

export default chatRoute
export const prefixOverride = '/ai'
