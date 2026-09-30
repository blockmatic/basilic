import { logger } from "@repo/utils/logger/server";
import { NextResponse } from "next/server";

import {
  clearAuthCookiesOnResponse,
  getServerAuthCookie,
  refreshTokensWithRefreshToken,
  setAuthCookiesOnResponse,
} from "@/lib/auth/auth-server";
import { resolveRequestId } from "@/lib/auth/request-id";
import { isSameOriginRequest } from "@/lib/auth/same-origin";

export async function POST(request: Request): Promise<Response> {
  const reqId = resolveRequestId(request.headers);
  if (!isSameOriginRequest(request)) {
    logger.warn(
      { reqId },
      "auth refresh rejected: cross-origin or missing Origin"
    );
    return new Response(JSON.stringify({ message: "Forbidden" }), {
      headers: { "Content-Type": "application/json" },
      status: 403,
    });
  }

  const { refreshToken } = await getServerAuthCookie();
  if (!refreshToken) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await refreshTokensWithRefreshToken({
    refreshToken,
    reqId,
    request,
  });
  if (result.status === "ok") {
    const response = new NextResponse(JSON.stringify(result.tokens), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
    setAuthCookiesOnResponse(response, result.tokens);
    return response;
  }

  if (result.status === "invalid") {
    const response = new NextResponse(
      JSON.stringify({ message: "Unauthorized" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      }
    );
    clearAuthCookiesOnResponse(response);
    return response;
  }

  return new Response(JSON.stringify({ message: "Auth service unavailable" }), {
    headers: { "Content-Type": "application/json" },
    status: 503,
  });
}
