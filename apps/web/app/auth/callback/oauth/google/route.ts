import type { NextResponse } from "next/server";

import { translateOAuthError } from "@/lib/auth/auth-error-messages";
import { handleOAuthBffGet } from "@/lib/auth/callback-utils";

export async function GET(request: Request): Promise<NextResponse> {
  return handleOAuthBffGet({
    exchange: ({ client, code, state }) =>
      client.auth.oauth.google.exchange({
        body: { code, state },
        throwOnError: true,
      }),
    failureMessage: "oauth_failed_google",
    fallbackMessage: "Google sign-in failed",
    mapError: (raw, body) => translateOAuthError(raw, body, "google"),
    method: "oauth_google",
    request,
  });
}
