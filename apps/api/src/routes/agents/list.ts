import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { AgentRecordSchema, agentCatalog } from "../../lib/agents/index.js";
import { RateLimitResponseSchema } from "../schemas.js";

const agentsListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description:
          "List public eve agents. No auth. Endpoints are absolute eve origins. A bask_ key is not an eve access JWT.",
        operationId: "listAgents",
        response: {
          200: Type.Array(AgentRecordSchema),
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "List agents",
        tags: ["agents"],
      },
    },
    async (_request, reply) => reply.code(200).send(agentCatalog())
  );
};

export default agentsListRoute;
export const prefixOverride = "/agents";
