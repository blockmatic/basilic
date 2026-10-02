import { getValidSession, isApiKeyActive } from "@repo/db";
import {
  extractBearerToken,
  ForbiddenError,
  verifyJwtHmac,
  withAuthChallenges,
} from "eve/channels/auth";
import type { AuthFn } from "eve/channels/auth";

import { env } from "./env.js";

interface AccessClaims {
  agent?: string;
  akid?: string;
  typ?: string;
  sub?: string;
  sid?: string;
}

function decodeJwtPayload(token: string): AccessClaims | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }
  try {
    return JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as AccessClaims;
  } catch {
    return null;
  }
}

export function basilicAccessJwt(): AuthFn<Request> {
  return withAuthChallenges(
    async (request) => {
      const token = extractBearerToken(request.headers.get("authorization"));
      if (!token) {
        return null;
      }
      const result = await verifyJwtHmac(token, {
        algorithm: "HS256",
        audiences: env.JWT_AUDIENCE,
        claims: { typ: ["access"] },
        issuer: env.JWT_ISSUER,
        secret: env.JWT_SECRET,
      });
      if (!result.ok) {
        return null;
      }
      const payload = decodeJwtPayload(token);
      if (!payload?.sub || !payload.sid || payload.typ !== "access") {
        return null;
      }
      const valid = await getValidSession({
        sid: payload.sid,
        userId: payload.sub,
      });
      if (!valid) {
        return null;
      }
      return {
        attributes: { sessionId: payload.sid },
        authenticator: "basilic-jwt",
        issuer: env.JWT_ISSUER,
        principalId: payload.sub,
        principalType: "user",
      };
    },
    [{ scheme: "Bearer" }]
  );
}

export function basilicAgentJwt({
  agentId,
}: {
  agentId: string;
}): AuthFn<Request> {
  return withAuthChallenges(
    async (request) => {
      const token = extractBearerToken(request.headers.get("authorization"));
      if (!token) return null;
      if (token.startsWith("bask_"))
        throw new ForbiddenError({
          code: "api_key_not_accepted",
          message:
            "API keys are not eve credentials. Exchange the key at POST /agents/{agentId}/token.",
        });
      const result = await verifyJwtHmac(token, {
        algorithm: "HS256",
        audiences: [env.AGENT_JWT_AUDIENCE],
        claims: { typ: ["agent"] },
        issuer: env.JWT_ISSUER,
        secret: env.JWT_SECRET,
      });
      if (!result.ok) return null;
      const payload = decodeJwtPayload(token);
      if (payload?.typ !== "agent" || payload.agent !== agentId || !payload.sub)
        throw new ForbiddenError({
          code: "invalid_agent_token",
          message: "This token is not valid for this agent.",
        });
      if (
        payload.akid &&
        !(await isApiKeyActive({ id: payload.akid, userId: payload.sub }))
      )
        throw new ForbiddenError({
          code: "invalid_agent_token",
          message: "This token was minted from a key that is no longer active.",
        });
      const attributes: Record<string, string> = {};
      if (payload.akid) attributes.apiKeyId = payload.akid;
      return {
        attributes,
        authenticator: "basilic-agent-jwt",
        issuer: env.JWT_ISSUER,
        principalId: payload.sub,
        principalType: "user",
      };
    },
    [{ scheme: "Bearer" }]
  );
}
