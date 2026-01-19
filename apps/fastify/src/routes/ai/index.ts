import { createOpenAI } from '@ai-sdk/openai'
import { type Static, Type } from '@sinclair/typebox'
import { generateText, streamText } from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../../lib/env.js'

const ChatMessageSchema = Type.Object({
  role: Type.Union([Type.Literal('user'), Type.Literal('assistant'), Type.Literal('system')]),
  content: Type.String(),
})

const ChatRequestSchema = Type.Object({
  messages: Type.Array(ChatMessageSchema, { minItems: 1 }),
  model: Type.Optional(Type.String({ default: 'gpt-4o-mini' })),
})

type ChatRequest = Static<typeof ChatRequestSchema>

const ChatResponseSchema = Type.Object({
  text: Type.String(),
})

const ErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
})

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
})

const aiRoutes: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description: 'Chat with AI using OpenAI',
        summary: 'Generate AI chat response',
        tags: ['ai'],
        body: ChatRequestSchema,
        response: {
          200: ChatResponseSchema,
          400: ErrorSchema,
          500: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      // Fastify validates automatically - request.body is typed and validated
      const body = request.body as ChatRequest
      const { messages, model } = body

      request.log.debug({ messages: messages.length, model }, 'Processing chat request')

      const result = await generateText({
        model: openai(model ?? 'gpt-4o-mini'),
        messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
      })

      return reply.code(200).send({
        text: result.text,
      })
    },
  )

  fastify.post(
    '/chat/stream',
    {
      schema: {
        operationId: 'chatStream',
        description: 'Stream AI chat response using OpenAI',
        summary: 'Stream AI chat response',
        tags: ['ai'],
        body: ChatRequestSchema,
        response: {
          200: Type.String({ description: 'Streaming text response' }),
          400: ErrorSchema,
          500: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      // Fastify validates automatically - request.body is typed and validated
      const body = request.body as ChatRequest
      const { messages, model } = body

      request.log.debug({ messages: messages.length, model }, 'Processing streaming chat request')

      const result = streamText({
        model: openai(model ?? 'gpt-4o-mini'),
        messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
      })

      reply.header('Content-Type', 'text/event-stream')
      reply.header('Cache-Control', 'no-cache')
      reply.header('Connection', 'keep-alive')

      // Use Fastify's native streaming support
      // Fastify handles the stream and will close it when done
      return reply.send(result.textStream)
    },
  )
}

export default aiRoutes
export const prefixOverride = '/ai'
