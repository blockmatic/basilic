import "#lib/host.js";
import {
  extractBearerToken,
  ForbiddenError,
  localDev,
  vercelOidc,
} from "eve/channels/auth";
import { defaultEveAuth, eveChannel } from "eve/channels/eve";

import { basilicAccessJwt } from "./auth.js";
import { channelCors } from "./cors.js";
import { env } from "./env.js";
import { inspectSessionPayload } from "./ingress.js";
import { consumeRateLimit } from "./rate-limit.js";

const hitsByPrincipal = new Map<string, number[]>();
const hitsByIp = new Map<string, number[]>();

function clientIp({ request }: { request: Request }) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function consumeKeyedLimit({
  key,
  hits,
}: {
  key: string;
  hits: Map<string, number[]>;
}) {
  const current = hits.get(key) ?? [];
  const result = consumeRateLimit({
    hits: current,
    max: env.EVE_RATE_LIMIT_MAX,
    now: Date.now(),
    windowMs: env.EVE_RATE_LIMIT_WINDOW_MS,
  });
  hits.set(key, result.hits);
  if (!result.ok) {
    throw new ForbiddenError({
      code: "rate_limited",
      message: `Rate limit exceeded. Retry after ${result.retryAfterSeconds}s`,
    });
  }
}

async function basilicAccessJwtWithLimit(request: Request) {
  const auth = await basilicAccessJwt()(request);
  if (!auth) {
    return null;
  }
  consumeKeyedLimit({ hits: hitsByPrincipal, key: auth.principalId });
  return auth;
}

async function basilicAnonymousWithLimit(request: Request) {
  if (extractBearerToken(request.headers.get("authorization"))) {
    return null;
  }
  consumeKeyedLimit({ hits: hitsByIp, key: clientIp({ request }) });
  return {
    attributes: {},
    authenticator: "anonymous",
    principalId: "anonymous",
    principalType: "anonymous" as const,
  };
}

export function createBasilicEveChannel() {
  return eveChannel({
    auth: [
      basilicAccessJwtWithLimit,
      basilicAnonymousWithLimit,
      vercelOidc(),
      localDev(),
    ],
    cors: channelCors(),
    async onMessage(ctx, message) {
      const body = await ctx.eve.request
        .clone()
        .json()
        .catch(() => ({ message }));
      const inspected = inspectSessionPayload({ body });
      if (!inspected.ok) {
        throw new ForbiddenError({
          code: "invalid_request",
          message: inspected.message,
        });
      }
      return { auth: defaultEveAuth(ctx) };
    },
  });
}
