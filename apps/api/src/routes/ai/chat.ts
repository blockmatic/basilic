import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { generateText, isStepCount, smoothStream, streamText } from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import {
  createRequestAbortSignal,
  createUiMessageStreamResponse,
  denyRemoteChatFileDownload,
  getMergedTools,
  getProvider,
  getResolvedProvider,
  handleUpstreamError,
  resolveMessages,
  sendWebResponse,
} from '../../lib/ai/index.js'
import { sendCatalogError, sendServerCatalogError } from '../../lib/catalogs/mapper.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema } from '../schemas.js'

const chatMessageTextMaxLength = 32_000
const chatMessagePartsMaxItems = 64
const chatMessageRoleSchema = Type.Union([Type.Literal('user'), Type.Literal('assistant')])

const ChatMessagePartSchema = Type.Union([
  Type.Object({
    type: Type.Literal('text'),
    text: Type.String({ maxLength: chatMessageTextMaxLength }),
  }),
  Type.Object({
    type: Type.Literal('reasoning'),
    text: Type.String({ maxLength: chatMessageTextMaxLength }),
    id: Type.Optional(Type.String({ maxLength: 256 })),
  }),
  Type.Object({
    type: Type.Literal('file'),
    mediaType: Type.String({ maxLength: 256 }),
    url: Type.String({ maxLength: 2048, pattern: '^data:' }),
    filename: Type.Optional(Type.String({ maxLength: 256 })),
  }),
  Type.Object({
    type: Type.Literal('step-start'),
  }),
  Type.Object({
    type: Type.Union([Type.Literal('dynamic-tool'), Type.Literal('tool-invocation')]),
    toolName: Type.String({ maxLength: 256 }),
    toolCallId: Type.String({ maxLength: 256 }),
    state: Type.String({ maxLength: 64 }),
    input: Type.Optional(Type.Unknown()),
    output: Type.Optional(Type.Unknown()),
    errorText: Type.Optional(Type.String({ maxLength: chatMessageTextMaxLength })),
  }),
])

const ChatMessageItemSchema = Type.Union([
  Type.Object({
    role: chatMessageRoleSchema,
    content: Type.String({ maxLength: chatMessageTextMaxLength }),
    name: Type.Optional(Type.String()),
  }),
  Type.Object({
    role: chatMessageRoleSchema,
    parts: Type.Array(ChatMessagePartSchema, { maxItems: chatMessagePartsMaxItems }),
  }),
])

const ChatRequestSchema = Type.Object({
  messages: Type.Array(ChatMessageItemSchema, { minItems: 1, maxItems: 50 }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String()),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
})

const ChatResponseSchema = Type.Object({
  text: Type.String(),
})

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
      if (!session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })

      const provider = getResolvedProvider()
      if (!provider) return sendServerCatalogError({ request, reply, code: 'SERVER_ERROR' })

      const { messages: rawMessages, stream, model, temperature } = request.body
      const resolvedModel = getProvider(provider, model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      const abortSignal = createRequestAbortSignal({ request, reply })
      const mergedTools = getMergedTools(session.user.id, request.log, abortSignal)

      const resolved = await resolveMessages(rawMessages as unknown[], mergedTools)
      if (!resolved.ok)
        return sendCatalogError({
          reply,
          status: 400,
          code: 'BAD_REQUEST',
        })

      const startMs = Date.now()
      request.log.debug(
        { messages: resolved.messages.length, model, stream: shouldStream, temperature },
        'Processing chat request',
      )

      const baseOptions = {
        model: resolvedModel,
        messages: resolved.messages,
        tools: mergedTools,
        stopWhen: isStepCount(env.AI_TOOL_MAX_STEPS),
        abortSignal,
        experimental_download: denyRemoteChatFileDownload,
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
          const response = createUiMessageStreamResponse(result)
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
          return sendWebResponse(reply, response)
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
        return handleUpstreamError({
          reply,
          err,
          logger: request.log,
          route: '/ai/chat',
          provider,
          startMs,
        })
      }
    },
  )
}

export default chatRoute
export const prefixOverride = '/ai'
