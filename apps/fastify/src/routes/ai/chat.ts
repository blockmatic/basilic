import { Readable } from 'node:stream'
import { createOpenAI } from '@ai-sdk/openai'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { generateText, streamText, type ToolSet } from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '@/lib/env.js'
import { ErrorResponseSchema } from '@/routes/schemas.js'

const ChatMessageSchema = Type.Object({
  role: Type.Union([Type.Literal('user'), Type.Literal('assistant'), Type.Literal('system')]),
  content: Type.String(),
})

const ChatRequestSchema = Type.Object({
  messages: Type.Array(ChatMessageSchema, { minItems: 1 }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String({ default: 'gpt-4o-mini' })),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
  tools: Type.Optional(Type.Any()),
})

const ChatResponseSchema = Type.Object({
  text: Type.String(),
})

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
})

const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description:
          'Chat with AI using OpenAI. Supports both streaming and non-streaming responses.',
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

      const { messages, stream, model, temperature, tools } = request.body

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      request.log.debug(
        { messages: messages.length, model, stream: shouldStream, temperature, hasTools: !!tools },
        'Processing chat request',
      )

      if (shouldStream) {
        const streamOptions = {
          model: openai(model ?? 'gpt-4o-mini'),
          messages,
          ...(temperature !== undefined && { temperature }),
          ...(tools != null &&
            typeof tools === 'object' &&
            Object.keys(tools).length > 0 && { tools: tools as ToolSet }),
        }

        const result = streamText(streamOptions)

        reply.header('Content-Type', 'text/event-stream')
        reply.header('Cache-Control', 'no-cache')
        reply.header('Connection', 'keep-alive')

        // Convert async iterable to Node.js Readable stream and pipe to response
        const nodeStream = Readable.from(result.textStream)
        return reply.send(nodeStream as never)
      }

      const generateOptions = {
        model: openai(model ?? 'gpt-4o-mini'),
        messages,
        ...(temperature !== undefined && { temperature }),
        ...(tools != null &&
          typeof tools === 'object' &&
          Object.keys(tools).length > 0 && { tools: tools as ToolSet }),
      }

      const result = await generateText(generateOptions)

      return reply.code(200).send({
        text: result.text,
      })
    },
  )
}

export default chatRoute
export const prefixOverride = '/ai'
