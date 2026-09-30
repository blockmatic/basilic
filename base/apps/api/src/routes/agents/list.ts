import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { AgentRecordSchema, agentCatalog } from "../../lib/agents-registry.js";
import { env } from "../../lib/env.js";
import { RateLimitResponseSchema } from "../schemas.js";

const agentsListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description:
          "List product eve agents. Public host discovery. Endpoints are absolute eve origins. An API key can call this route when a session is not required. A bask_ key is not an eve access JWT.",
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
    async (_request, reply) =>
      reply.code(200).send(
        agentCatalog({
          commandUrl: env.EVE_COMMAND_URL,
        })
      )
  );
};

export default agentsListRoute;
export const prefixOverride = "/agents";
