import { createGateway } from "ai";

import { env } from "./env.js";

export function gatewayAuthToken() {
  return env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN;
}

export function createProductGateway() {
  const apiKey = gatewayAuthToken();
  if (!apiKey) {
    return null;
  }
  return createGateway({ apiKey });
}
