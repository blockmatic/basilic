import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { dbHealth } from "../db/probe.js";

export const HealthResponseSchema = Type.Object({
  dbReady: Type.Boolean(),
  ok: Type.Boolean(),
});

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        description:
          "Readiness: process is up and the database answers SELECT 1",
        operationId: "healthCheck",
        response: {
          200: HealthResponseSchema,
          503: HealthResponseSchema,
        },
        security: [],
        summary: "Returns server health status",
        tags: ["health"],
      },
    },
    async (_request, reply) => {
      const dbReady = await dbHealth.probe();
      if (!dbReady) {
        return reply.code(503).send({ ok: false, dbReady: false });
      }
      return reply.code(200).send({ dbReady: true, ok: true });
    }
  );
};

export default healthRoutes;
