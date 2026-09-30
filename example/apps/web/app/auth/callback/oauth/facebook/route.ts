import type { NextResponse } from "next/server";

import { handleOAuthBffGet } from "@/lib/auth/callback-utils";

function mapAuthError(raw: string) {
  const known: Record<string, string> = {
    "Could not retrieve email from Facebook": "facebook_email_required",
    "Facebook OAuth is not configured": "facebook_oauth_not_configured",
    "Facebook sign-in failed": "facebook_oauth_failed",
    "Failed to exchange code for token": "facebook_token_exchange_failed",
    "Failed to fetch Facebook user": "facebook_fetch_user_failed",
    "Invalid or expired state": "facebook_invalid_state",
    "State has expired": "facebook_expired_state",
  };
  return known[raw] ?? "facebook_oauth_failed";
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleOAuthBffGet({
    exchange: ({ client, code, state }) =>
      client.auth.oauth.facebook.exchange({
        body: { code, state },
        throwOnError: true,
      }),
    failureMessage: "facebook_oauth_failed",
    fallbackMessage: "Facebook sign-in failed",
    mapError: mapAuthError,
    method: "oauth_facebook",
    request,
  });
}
