import type { FastifyPluginAsync } from "fastify";

import { sendOpenApiDocument } from "../lib/openapi-document.js";

const openapiJsonRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/openapi.json",
    {
      schema: {
        hide: true,
        security: [],
        tags: ["public"],
      },
    },
    async (request, reply) => sendOpenApiDocument({ fastify, reply, request })
  );
};

export default openapiJsonRoute;
