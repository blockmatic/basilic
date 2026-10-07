import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { generateText } from "ai";
import type { FastifyPluginAsync } from "fastify";

import { enhancePromptInstruction } from "../../lib/ai/enhance-instruction.js";
import {
  aiRouteRateLimitConfig,
  createRequestAbortSignal,
  getProvider,
  getResolvedProvider,
  handleUpstreamError,
} from "../../lib/ai/index.js";
import {
  sendCatalogError,
  sendServerCatalogError,
} from "../../lib/catalogs/mapper.js";
import { env } from "../../lib/env.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../schemas.js";

const maxPromptLength = 32_000;
const enhanceTemperature = 0.4;

const EnhanceRequestSchema = Type.Object({
  prompt: Type.String({ minLength: 1, maxLength: maxPromptLength }),
});

const EnhanceResponseSchema = Type.Object({
  text: Type.String(),
});

const enhanceRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/enhance",
    {
      config: aiRouteRateLimitConfig,
      schema: {
        body: EnhanceRequestSchema,
        description:
          "Rewrite a draft prompt: fix typos and speech-to-text errors, clarify thin drafts. Uses Anthropic via ANTHROPIC_API_KEY. Returns JSON only.",
        operationId: "enhance",
        response: {
          200: EnhanceResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          402: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Enhance prompt draft",
        tags: ["ai"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }

      const { prompt: rawPrompt } = request.body;
      const prompt = rawPrompt.trim();
      if (!prompt) {
        return sendCatalogError({ reply, status: 400, code: "BAD_REQUEST" });
      }

      const provider = getResolvedProvider();
      if (!provider) {
        return sendServerCatalogError({ request, reply, code: "SERVER_ERROR" });
      }

      const resolvedModel = getProvider(provider, "default");
      const startMs = Date.now();
      request.log.debug(
        { promptLength: prompt.length },
        "Processing enhance request"
      );

      const abortSignal = createRequestAbortSignal({ reply, request });

      try {
        const result = await generateText({
          abortSignal,
          maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
          model: resolvedModel,
          prompt,
          system: enhancePromptInstruction,
          temperature: enhanceTemperature,
        });

        const text = result.text.trim();
        if (!text) {
          return sendCatalogError({
            code: "UPSTREAM_SERVICE_ERROR",
            reply,
            status: 502,
          });
        }

        request.log.info(
          {
            durationMs: Date.now() - startMs,
            provider,
            route: "/ai/enhance",
          },
          "Enhance completed"
        );
        return reply.code(200).send({ text });
      } catch (err) {
        return handleUpstreamError({
          reply,
          err,
          logger: request.log,
          route: "/ai/enhance",
          provider,
          startMs,
        });
      }
    }
  );
};

export default enhanceRoute;
export const prefixOverride = "/ai";
