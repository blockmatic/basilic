import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import {
  convertToModelMessages,
  generateText,
  type ModelMessage,
  smoothStream,
  streamText,
  type ToolSet,
} from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import { ErrorResponseSchema } from '../schemas.js'
import { defaultOllamaModel, getProvider, getResolvedProvider } from './provider.js'

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
  model: Type.Optional(Type.String({ default: defaultOllamaModel })),
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

/** Phase 1: plain chat only (no tools). Phase 3 re-enables tools. */
function getMergedTools(): ToolSet {
  return {}
}

const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description:
          'Chat with AI via Ollama (default) or Open Router. Set OLLAMA_BASE_URL or OPEN_ROUTER_API_KEY. Default model configurable via AI_DEFAULT_MODEL. Supports streaming and tools.',
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
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const provider = getResolvedProvider()
      if (!provider)
        return reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No AI provider configured. Set OLLAMA_BASE_URL or OPEN_ROUTER_API_KEY.',
        })

      const { messages: rawMessages, stream, model, temperature } = request.body
      const resolvedModel = getProvider(provider, model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      const mergedTools = getMergedTools()

      let messages: Awaited<ReturnType<typeof resolveMessages>>
      try {
        messages = await resolveMessages(rawMessages as unknown[], mergedTools)
      } catch (err) {
        return reply.code(400).send({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Invalid message format',
        })
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
        return reply.send(response.body as never)
      }

      const result = await generateText(baseOptions)
      return reply.code(200).send({ text: result.text })
    },
  )
}

export default chatRoute
export const prefixOverride = '/ai'
