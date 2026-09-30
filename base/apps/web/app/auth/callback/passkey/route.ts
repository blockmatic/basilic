import { redirect, unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

import { capture } from "@/lib/analytics";
import { setAuthCookiesOnResponse } from "@/lib/auth/auth-server";
import { createBffClient, logAuthBffFailure } from "@/lib/auth/bff-client";
import { extractTokens } from "@/lib/auth/callback-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    typeof rawCallbackUrl === "string" &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : null;

  if (!code) {
    capture({
      errorCode: "INVALID_OR_EXPIRED_CODE",
      method: "passkey",
      name: "auth_failed",
    });
    redirect(
      `/auth/login?message=${encodeURIComponent("INVALID_OR_EXPIRED_CODE")}`
    );
  }

  const { origin } = new URL(request.url);
  const { client, reqId } = createBffClient({
    extraHeaders: { "X-Callback-Origin": origin },
    request,
  });

  try {
    const response = await client.auth.passkey.exchange({
      body: { code },
    });
    const tokens = extractTokens(response);
    if (!tokens) {
      capture({
        errorCode: "INVALID_OR_EXPIRED_CODE",
        method: "passkey",
        name: "auth_failed",
      });
      redirect(
        `/auth/login?message=${encodeURIComponent("INVALID_OR_EXPIRED_CODE")}`
      );
    }

    const redirectUrl = callbackUrl ?? "/";
    const redirectResponse = NextResponse.redirect(
      new URL(redirectUrl, request.url),
      303
    );
    setAuthCookiesOnResponse(redirectResponse, tokens);
    capture({ method: "passkey", name: "auth_succeeded" });
    return redirectResponse;
  } catch (error) {
    unstable_rethrow(error);
    logAuthBffFailure({ error: error, reqId, method: "passkey" });
    capture({
      errorCode: "INVALID_OR_EXPIRED_CODE",
      method: "passkey",
      name: "auth_failed",
    });
    return NextResponse.redirect(
      new URL(
        `/auth/login?message=${encodeURIComponent("INVALID_OR_EXPIRED_CODE")}`,
        request.url
      ),
      303
    );
  }
}
