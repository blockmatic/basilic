import type { FastifyReply, FastifyRequest } from "fastify";

import { getError } from "../catalogs/mapper.js";
import {
  applyProblemContentType,
  toCatalogProblem,
} from "../catalogs/problem.js";

const nextSteps = {
  NOT_FOUND: {
    resolution:
      "Call GET /agents and use a listed public agent id. Private specialists are not addressable.",
    retryable: false,
  },
  UNAUTHORIZED: {
    resolution:
      "Send Authorization: Bearer <access JWT> or X-API-Key: bask_<prefix>_<secret>. Create or rotate a key in Settings > Security; revoked keys stop working immediately.",
    retryable: false,
  },
} as const;

export type AgentProblemCode = keyof typeof nextSteps;

export function sendAgentProblem({
  request,
  reply,
  status,
  code,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  status: number;
  code: AgentProblemCode;
}): FastifyReply {
  const message = getError(code)?.message ?? code;
  return applyProblemContentType({ reply })
    .code(status)
    .send({
      ...toCatalogProblem({ code, message, status }),
      ...nextSteps[code],
      traceId: request.id,
    });
}
