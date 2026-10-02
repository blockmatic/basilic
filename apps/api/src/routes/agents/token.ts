import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { agentById, sendAgentProblem } from "../../lib/agents/index.js";
import { env } from "../../lib/env.js";
import { createAgentTokenPayload } from "../../lib/jwt.js";
import { AgentProblemSchema, RateLimitResponseSchema } from "../schemas.js";

const AgentTokenResponseSchema = Type.Object({
  agentId: Type.String(),
  endpoint: Type.String(),
  expiresIn: Type.Integer(),
  token: Type.String(),
});

const agentsTokenRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/:agentId/token",
    {
      schema: {
        description:
          "Exchange an access JWT or API key for a short-lived eve bearer bound to one public agent. The token has typ=agent, the agent audience, and no refresh token. Open the eve session and attach its stream before it expires. eve rejects a raw bask_ key.",
        operationId: "createAgentToken",
        params: Type.Object({ agentId: Type.String({ minLength: 1 }) }),
        response: {
          200: AgentTokenResponseSchema,
          401: AgentProblemSchema,
          404: AgentProblemSchema,
          429: RateLimitResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Create agent token",
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
      const userId = request.session.user.id;
      const apiKeyId =
        request.session.authKind === "api-key"
          ? request.session.session.id
          : undefined;
      const token = fastify.jwt.sign(
        createAgentTokenPayload({ agentId: row.id, apiKeyId, userId }),
        { expiresIn: `${env.AGENT_TOKEN_TTL_SECONDS}s` }
      );
      request.log.info(
        { agentId: row.id, apiKeyId, userId },
        "agent_token_issued"
      );
      return reply.code(200).send({
        agentId: row.id,
        endpoint: row.endpoint,
        expiresIn: env.AGENT_TOKEN_TTL_SECONDS,
        token,
      });
    }
  );
};

export default agentsTokenRoute;
export const prefixOverride = "/agents";
