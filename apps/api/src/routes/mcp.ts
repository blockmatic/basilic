import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { FastifyPluginAsync } from "fastify";

import { sendAgentProblem } from "../lib/agents/index.js";
import { createAgentsMcpServer } from "../lib/mcp.js";

const mcpRoute: FastifyPluginAsync = async (fastify) => {
  const handler = createMcpHandler(({ requestInfo }) =>
    createAgentsMcpServer({
      fastify,
      headers: requestInfo?.headers ?? new Headers(),
    })
  );
  const serve = toNodeHandler(handler);
  fastify.addHook("onClose", () => handler.close());

  fastify.route({
    handler: async (request, reply) => {
      if (!request.session)
        return sendAgentProblem({
          code: "UNAUTHORIZED",
          reply,
          request,
          status: 401,
        });
      reply.hijack();
      await serve(request.raw, reply.raw, request.body);
    },
    method: ["GET", "POST", "DELETE"],
    schema: { hide: true, security: [], tags: ["agents"] },
    url: "/mcp",
  });
};

export default mcpRoute;
