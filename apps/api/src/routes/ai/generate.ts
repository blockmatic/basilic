import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { generateText, streamText } from "ai";
import type { FastifyPluginAsync } from "fastify";

import {
  aiRouteRateLimitConfig,
  createRequestAbortSignal,
  createUiMessageStreamResponse,
  getProvider,
  getResolvedProvider,
  handleUpstreamError,
  isAllowedRequestModel,
  sendWebResponse,
} from "../../lib/ai/index.js";
import {
  sendCatalogError,
  sendServerCatalogError,
} from "../../lib/catalogs/mapper.js";
import { env } from "../../lib/env.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../schemas.js";

const maxPromptLength = 32_000;

const GenerateRequestSchema = Type.Object({
  model: Type.Optional(Type.String({ default: "default" })),
  prompt: Type.String({ minLength: 1, maxLength: maxPromptLength }),
  stream: Type.Optional(Type.Boolean()),
  temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
});

const GenerateResponseSchema = Type.Object({
  text: Type.String(),
});

const generateRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/generate",
    {
      config: aiRouteRateLimitConfig,
      schema: {
        body: GenerateRequestSchema,
        description:
          "Generate text from a single prompt (CLI, scripts, pipelines). Uses Anthropic via ANTHROPIC_API_KEY. Returns SSE (text/event-stream) when streaming.",
        operationId: "generate",
        response: {
          200: Type.Union([
            GenerateResponseSchema,
            Type.String({
              description:
                "Streaming SSE (text/event-stream) with JSON event objects",
            }),
          ]),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          402: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Generate text from prompt",
        tags: ["ai"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }

      const { prompt: rawPrompt, stream, model, temperature } = request.body;
      const prompt = rawPrompt.trim();
      if (!prompt) {
        return sendCatalogError({ reply, status: 400, code: "BAD_REQUEST" });
      }

      const provider = getResolvedProvider();
      if (!isAllowedRequestModel({ model, provider })) {
        return sendCatalogError({ reply, status: 400, code: "BAD_REQUEST" });
      }
      if (!provider) {
        return sendServerCatalogError({ request, reply, code: "SERVER_ERROR" });
      }

      const resolvedModel = getProvider(provider, model);

      const acceptHeader = request.headers.accept?.toLowerCase() ?? "";
      const shouldStream =
        stream === true || acceptHeader.includes("text/event-stream");

      const startMs = Date.now();
      request.log.debug(
        {
          model,
          promptLength: prompt.length,
          stream: shouldStream,
          temperature,
        },
        "Processing generate request"
      );

      const abortSignal = createRequestAbortSignal({ reply, request });
      const baseOptions = {
        abortSignal,
        maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
        model: resolvedModel,
        prompt,
        ...(temperature !== undefined && { temperature }),
      };

      try {
        if (shouldStream) {
          const result = streamText(baseOptions);
          const response = createUiMessageStreamResponse(result);
          request.log.info(
            {
              durationMs: Date.now() - startMs,
              model,
              provider,
              route: "/ai/generate",
              stream: true,
            },
            "Generate stream started"
          );
          return sendWebResponse(reply, response);
        }

        const result = await generateText(baseOptions);
        request.log.info(
          {
            durationMs: Date.now() - startMs,
            model,
            provider,
            route: "/ai/generate",
            stream: false,
          },
          "Generate completed"
        );
        return reply.code(200).send({ text: result.text });
      } catch (err) {
        return handleUpstreamError({
          reply,
          err,
          logger: request.log,
          route: "/ai/generate",
          provider,
          startMs,
        });
      }
    }
  );
};

export default generateRoute;
export const prefixOverride = "/ai";
