import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import {
  AgentRecordSchema,
  agentById,
  sendAgentProblem,
} from "../../lib/agents/index.js";
import { AgentProblemSchema, RateLimitResponseSchema } from "../schemas.js";

const AgentIdParamsSchema = Type.Object({
  agentId: Type.String({ minLength: 1 }),
});

const agentsGetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/:agentId",
    {
      schema: {
        description:
          "Get one public eve agent by id. Session required. An API key satisfies Fastify session auth.",
        operationId: "getAgentById",
        params: AgentIdParamsSchema,
        response: {
          200: AgentRecordSchema,
          401: AgentProblemSchema,
          404: AgentProblemSchema,
          429: RateLimitResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Get agent",
        tags: ["agents"],
      },
    },
    async (request, reply) => {
      if (!request.session)
        return sendAgentProblem({
          code: "UNAUTHORIZED",
          reply,
          request,
          status: 401,
        });
      const row = agentById({ agentId: request.params.agentId });
      if (!row)
        return sendAgentProblem({
          code: "NOT_FOUND",
          reply,
          request,
          status: 404,
        });
      return reply.code(200).send(row);
    }
  );
};

export default agentsGetRoute;
export const prefixOverride = "/agents";
