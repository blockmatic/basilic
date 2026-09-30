import fastifyJwt from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

import { env } from "../lib/env.js";

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      algorithm: "HS256",
    },
    verify: {
      algorithms: ["HS256"],
      allowedAud: env.JWT_AUDIENCE,
      allowedIss: env.JWT_ISSUER,
    },
  });
};

export default fp(jwtPlugin, {
  dependencies: [],
  name: "jwt",
});
