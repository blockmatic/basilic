import type { TestContext } from "vitest";

import { isInsufficientCreditsResponse } from "../../src/lib/ai/upstream-error.js";

/** Skip only upstream provider credit errors — other 402 responses still fail the suite. */
export const skipIfInsufficientCredits = (
  ctx: TestContext,
  res: { statusCode: number; body: string },
  name: string
): void => {
  if (!isInsufficientCreditsResponse(res)) {
    return;
  }
  ctx.skip(`[AI test] ${name}: 402 insufficient credits`);
};

interface ResponseLike {
  statusCode: number;
  body: string;
  headers?: Record<string, string | string[] | number | undefined>;
}

const isConnectionClassFailure = (res: ResponseLike): boolean =>
  res.statusCode === 503 ||
  res.statusCode === 504 ||
  /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(res.body);

export const isProviderUnavailable = (res: ResponseLike): boolean =>
  res.statusCode === 502 || isConnectionClassFailure(res);

export const hasRealGatewayKey = (): boolean => {
  const key = process.env.AI_GATEWAY_API_KEY;
  if (!key) {
    return false;
  }
  if (
    key.includes("dummy") ||
    key.includes("placeholder") ||
    key.includes("xxx")
  ) {
    return false;
  }
  return true;
};

export const skipIfProviderUnavailable = (
  ctx: TestContext,
  res: ResponseLike,
  name: string
): void => {
  if (hasRealGatewayKey()) {
    return;
  }
  if (isProviderUnavailable(res)) {
    ctx.skip(`[AI test] ${name}: AI provider unreachable (${res.statusCode})`);
  }
};
