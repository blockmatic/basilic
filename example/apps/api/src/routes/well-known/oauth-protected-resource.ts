import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getLandingUrls, getRequestOrigin } from "../../lib/agent/index.js";

const ProtectedResourceSchema = Type.Object({
  bearer_methods_supported: Type.Array(Type.Literal("header")),
  resource: Type.String({ format: "uri" }),
  resource_documentation: Type.String({ format: "uri" }),
  resource_name: Type.String(),
  resource_policy_uri: Type.String({ format: "uri" }),
  resource_tos_uri: Type.String({ format: "uri" }),
});

const oauthProtectedResourceRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/oauth-protected-resource",
    {
      schema: {
        hide: true,
        response: {
          200: ProtectedResourceSchema,
        },
        security: [],
        tags: ["public"],
      },
    },
    async (request, reply) => {
      const origin = getRequestOrigin({ request });
      const urls = getLandingUrls();
      return reply.send({
        bearer_methods_supported: ["header"],
        resource: origin,
        resource_documentation: `${urls.docs}/docs/architecture/authentication`,
        resource_name: "Basilic Fastify API",
        resource_policy_uri: urls.privacy,
        resource_tos_uri: urls.terms,
      });
    }
  );
};

export default oauthProtectedResourceRoute;
export const prefixOverride = "/.well-known";
