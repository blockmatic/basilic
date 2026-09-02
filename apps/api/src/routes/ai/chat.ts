import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import {
  consumeStream,
  convertToModelMessages,
  generateText,
  isStepCount,
  type ModelMessage,
  smoothStream,
  streamText,
  type ToolSet,
} from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../lib/catalogs/mapper.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema } from '../schemas.js'
import { getMergedTools } from './account-info-tool.js'
import { getProvider, getResolvedProvider } from './provider.js'
import { isInsufficientCreditsError } from './upstream-error.js'

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
  model: Type.Optional(Type.String()),
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

const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/chat',
    {
      schema: {
        operationId: 'chat',
        description:
          'Chat with AI via Anthropic, Open Router, or Ollama. Set ANTHROPIC_API_KEY, OPEN_ROUTER_API_KEY, or OLLAMA_BASE_URL. Default model configurable via AI_DEFAULT_MODEL. Supports streaming and tools.',
        summary: 'Generate AI chat response',
        tags: ['ai'],
        security: [{ bearerAuth: [] }],
        body: ChatRequestSchema,
        response: {
          200: {
            description: 'Chat response (JSON) or streaming (SSE)',
            content: {
              'application/json': { schema: ChatResponseSchema },
              'text/event-stream': {
                schema: Type.String({ description: 'Streaming SSE response' }),
              },
            },
          },
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          402: ErrorResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
          504: ErrorResponseSchema,
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
          code: 'SERVER_ERROR',
          message:
            'No AI provider configured. Set ANTHROPIC_API_KEY (default), OPEN_ROUTER_API_KEY, or OLLAMA_BASE_URL.',
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

      const requestAbortController = new AbortController()
      // Listen for client abort only — not `close`, which also fires when the
      // response stream ends and would cut off long-running AI streams prematurely.
      request.raw.once('aborted', () => requestAbortController.abort())
      const abortSignal = AbortSignal.any([
        requestAbortController.signal,
        AbortSignal.timeout(env.AI_UPSTREAM_TIMEOUT_MS),
      ])
      const baseOptions = {
        model: resolvedModel,
        messages,
        tools: mergedTools,
        stopWhen: isStepCount(env.AI_TOOL_MAX_STEPS),
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
          const response = result.toUIMessageStreamResponse({ consumeSseStream: consumeStream })
          for (const [k, v] of response.headers) reply.raw.setHeader(k, v)
          reply.raw.statusCode = response.status
          request.log.info(
            {
              route: '/ai/chat',
              provider,
              model: request.body.model ?? 'default',
              stream: true,
              durationMs: Date.now() - startMs,
              authenticated: true,
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
            authenticated: true,
          },
          'Chat completed',
        )
        return reply.code(200).send({ text: result.text })
      } catch (err) {
        const errObj = err instanceof Error ? err : new Error(String(err))
        request.log.error(
          {
            route: '/ai/chat',
            provider,
            error: errObj.message,
            cause: errObj.cause != null ? String(errObj.cause) : undefined,
            stack: errObj.stack,
            durationMs: Date.now() - startMs,
          },
          'Chat upstream error',
        )
        if (isInsufficientCreditsError(err))
          return reply.code(402).send({
            code: 'INSUFFICIENT_CREDITS',
            message: errObj.message.slice(0, 256) || 'Insufficient credits',
          })
        if (errObj.name === 'AbortError' || errObj.name === 'TimeoutError')
          return sendCatalogError({ reply, status: 504, code: 'UPSTREAM_TIMEOUT' })
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
