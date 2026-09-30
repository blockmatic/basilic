import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { ErrorResponseSchema } from "../schemas.js";
import { assertTestRoutesEnabled } from "./assert-test-routes-enabled.js";

const AuthedResponseSchema = Type.Object({
  user: Type.Object({
    email: Type.Union([Type.String(), Type.Null()]),
    id: Type.String(),
  }),
});

const authedTestRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description:
          "Dummy authenticated endpoint for testing (requires Bearer token)",
        operationId: "testAuthed",
        response: {
          200: AuthedResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
        summary: "Test authenticated endpoint",
        tags: ["test"],
      },
    },
    async (request, reply) => {
      if (!assertTestRoutesEnabled(reply)) {
        return;
      }

      if (!request.session) {
        return reply.code(401).send({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      return reply.code(200).send({
        user: {
          email: request.session.user.email ?? null,
          id: request.session.user.id,
        },
      });
    }
  );
};

export default authedTestRoute;
export const prefixOverride = "/test/authed";
