import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { generateText, streamText } from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import {
  createRequestAbortSignal,
  createUiMessageStreamResponse,
  getProvider,
  getResolvedProvider,
  handleUpstreamError,
  sendWebResponse,
} from '../../lib/ai/index.js'
import { sendCatalogError } from '../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../schemas.js'

const maxPromptLength = 32_000

const GenerateRequestSchema = Type.Object({
  prompt: Type.String({ minLength: 1, maxLength: maxPromptLength }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String({ default: 'default' })),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
})

const GenerateResponseSchema = Type.Object({
  text: Type.String(),
})

const generateRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/generate',
    {
      schema: {
        operationId: 'generate',
        description:
          'Generate text from a single prompt (CLI, scripts, pipelines). Uses Anthropic, Open Router, or Ollama. Returns SSE (text/event-stream) when streaming.',
        summary: 'Generate text from prompt',
        tags: ['ai'],
        security: [{ bearerAuth: [] }],
        body: GenerateRequestSchema,
        response: {
          200: Type.Union([
            GenerateResponseSchema,
            Type.String({
              description: 'Streaming SSE (text/event-stream) with JSON event objects',
            }),
          ]),
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
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })

      const provider = getResolvedProvider()
      if (!provider) {
        request.log.warn('No AI provider configured')
        return sendCatalogError({ reply, status: 500, code: 'SERVER_ERROR' })
      }

      const { prompt: rawPrompt, stream, model, temperature } = request.body
      const prompt = rawPrompt.trim()
      if (!prompt) return sendCatalogError({ reply, status: 400, code: 'BAD_REQUEST' })

      const resolvedModel = getProvider(provider, model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      const startMs = Date.now()
      request.log.debug(
        { promptLength: prompt.length, model, stream: shouldStream, temperature },
        'Processing generate request',
      )

      const abortSignal = createRequestAbortSignal(request)
      const baseOptions = {
        model: resolvedModel,
        prompt,
        abortSignal,
        ...(temperature !== undefined && { temperature }),
      }

      try {
        if (shouldStream) {
          const result = streamText(baseOptions)
          const response = createUiMessageStreamResponse(result)
          request.log.info(
            {
              route: '/ai/generate',
              provider,
              model,
              stream: true,
              durationMs: Date.now() - startMs,
            },
            'Generate stream started',
          )
          return sendWebResponse(reply, response)
        }

        const result = await generateText(baseOptions)
        request.log.info(
          {
            route: '/ai/generate',
            provider,
            model,
            stream: false,
            durationMs: Date.now() - startMs,
          },
          'Generate completed',
        )
        return reply.code(200).send({ text: result.text })
      } catch (err) {
        return handleUpstreamError({
          reply,
          err,
          logger: request.log,
          route: '/ai/generate',
          provider,
          startMs,
        })
      }
    },
  )
}

export default generateRoute
export const prefixOverride = '/ai'
