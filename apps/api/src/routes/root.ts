import type { FastifyPluginAsync } from "fastify";

import { sendLandingPage } from "../lib/agent/index.js";

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    "/",
    {
      schema: {
        hide: true,
        security: [],
        tags: ["public"],
      },
    },
    async (request, reply) => sendLandingPage({ reply, request })
  );
};

export default root;
