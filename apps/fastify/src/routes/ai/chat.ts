import { Readable } from 'node:stream'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { Type } from '@sinclair/typebox'
import type { LanguageModel } from 'ai'
import { generateText, streamText, type ToolSet, tool } from 'ai'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { getDb } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema } from '../schemas.js'

const ChatMessageSchema = Type.Object({
  role: Type.Union([Type.Literal('user'), Type.Literal('assistant'), Type.Literal('system')]),
  content: Type.String(),
})

const ChatRequestSchema = Type.Object({
  messages: Type.Array(ChatMessageSchema, { minItems: 1 }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String({ default: 'openrouter/aurora-alpha' })),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
  tools: Type.Optional(Type.Any()),
})

const ChatResponseSchema = Type.Object({
  text: Type.String(),
})

const DEFAULT_MODEL = 'openrouter/aurora-alpha'

const MODEL_ALIASES: Record<string, string> = {
  'aurora-alpha': DEFAULT_MODEL,
  grok: 'x-ai/grok-3-mini',
  'grok-3-mini': 'x-ai/grok-3-mini',
  sonnet: 'anthropic/claude-3-5-sonnet',
  opus: 'anthropic/claude-3-opus',
}

function getOpenRouter() {
  return createOpenRouter({ apiKey: env.OPEN_ROUTER_API_KEY })
}

function resolveModel(model?: string): LanguageModel {
  const m = model ?? DEFAULT_MODEL
  const modelId = MODEL_ALIASES[m] ?? (m.startsWith('gpt') ? `openai/${m}` : m)
  return getOpenRouter()(modelId) as unknown as LanguageModel
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
      const joined = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(user.createdAt)
      const parts = [`You joined in ${joined}`]
      if (user.email) parts.push(`Email: ${user.email}`)
      if (user.name) parts.push(`Name: ${user.name}`)
      return parts.join('. ')
    },
  })
}

const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description:
          'Chat with AI via Open Router. Default model: Aurora Alpha. Supports streaming and tools.',
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
        },
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }

      if (!env.OPEN_ROUTER_API_KEY) {
        return reply.code(400).send({
          code: 'BAD_REQUEST',
          message: 'OPEN_ROUTER_API_KEY is required',
        })
      }

      const { messages, stream, model, temperature, tools: clientTools } = request.body
      const resolvedModel = resolveModel(model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      const mergedTools: ToolSet = {
        getAccountInfo: createAccountInfoTool(request.session.user.id),
        ...(clientTools != null && typeof clientTools === 'object' ? (clientTools as ToolSet) : {}),
      }

      request.log.debug(
        { messages: messages.length, model, stream: shouldStream, temperature },
        'Processing chat request',
      )

      const baseOptions = {
        model: resolvedModel,
        messages,
        tools: mergedTools,
        ...(temperature !== undefined && { temperature }),
      }

      if (shouldStream) {
        const result = streamText(baseOptions)
        reply.header('Content-Type', 'text/event-stream')
        reply.header('Cache-Control', 'no-cache')
        reply.header('Connection', 'keep-alive')
        const nodeStream = Readable.from(result.textStream)
        return reply.send(nodeStream as never)
      }

      const result = await generateText(baseOptions)
      return reply.code(200).send({ text: result.text })
    },
  )
}

export default chatRoute
export const prefixOverride = '/ai'
