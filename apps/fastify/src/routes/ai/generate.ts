import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { generateText, streamText } from 'ai'
import type { FastifyPluginAsync } from 'fastify'
import { ErrorResponseSchema } from '../schemas.js'
import { defaultOllamaModel, getProvider, getResolvedProvider } from './provider.js'

const maxPromptLength = 32_000

const GenerateRequestSchema = Type.Object({
  prompt: Type.String({ minLength: 1, maxLength: maxPromptLength }),
  stream: Type.Optional(Type.Boolean()),
  model: Type.Optional(Type.String({ default: defaultOllamaModel })),
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
          'Generate text from a single prompt (CLI, scripts, pipelines). Uses Ollama or Open Router. Returns plain text SSE when streaming.',
        summary: 'Generate text from prompt',
        tags: ['ai'],
        security: [{ bearerAuth: [] }],
        body: GenerateRequestSchema,
        response: {
          200: Type.Union([
            GenerateResponseSchema,
            Type.String({ description: 'Streaming plain text SSE' }),
          ]),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
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

      const { prompt: rawPrompt, stream, model, temperature } = request.body
      const prompt = rawPrompt.trim()
      if (!prompt)
        return reply.code(400).send({
          code: 'BAD_REQUEST',
          message: 'Prompt must not be empty',
        })

      const resolvedModel = getProvider(provider, model)

      const acceptHeader = request.headers.accept?.toLowerCase() ?? ''
      const shouldStream = stream === true || acceptHeader.includes('text/event-stream')

      request.log.debug(
        { promptLength: prompt.length, model, stream: shouldStream, temperature },
        'Processing generate request',
      )

      const baseOptions = {
        model: resolvedModel,
        prompt,
        ...(temperature !== undefined && { temperature }),
      }

      if (shouldStream) {
        const result = streamText(baseOptions)
        const response = result.toTextStreamResponse()
        for (const [k, v] of response.headers) reply.raw.setHeader(k, v)
        reply.raw.statusCode = response.status
        return reply.send(response.body as never)
      }

      const result = await generateText(baseOptions)
      return reply.code(200).send({ text: result.text })
    },
  )
}

export default generateRoute
export const prefixOverride = '/ai'
