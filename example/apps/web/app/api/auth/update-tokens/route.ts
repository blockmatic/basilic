import { ApiError } from "@repo/core";
import { captureError } from "@repo/error/nextjs/server";
import { logger } from "@repo/utils/logger/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookiesOnResponse } from "@/lib/auth/auth-server";
import { createBffClient } from "@/lib/auth/bff-client";
import { resolveRequestId } from "@/lib/auth/request-id";
import { isSameOriginRequest } from "@/lib/auth/same-origin";

const updateTokensSchema = z.object({
  refreshToken: z.string(),
  token: z.string(),
});

export async function POST(request: Request) {
  const reqId = resolveRequestId(request.headers);
  if (!isSameOriginRequest(request)) {
    logger.warn(
      { reqId },
      "update-tokens rejected: cross-origin or missing Origin"
    );
    return new Response(JSON.stringify({ message: "Forbidden" }), {
      headers: { "Content-Type": "application/json" },
      status: 403,
    });
  }

  try {
    const parsed = updateTokensSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          message:
            parsed.error.issues[0]?.message ??
            "token and refreshToken required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { token, refreshToken } = parsed.data;
    const { client } = createBffClient({ request });

    try {
      const authHeader = "Authorization";
      await client.auth.session.validateTokens({
        body: { refreshToken },
        headers: { [authHeader]: `Bearer ${token}` },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logger.warn(
          { reqId, status: error.status },
          "update-tokens rejected: invalid token pair"
        );
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      captureError({
        code: "INTERNAL_ERROR",
        data: {
          reqId,
          status: error instanceof ApiError ? error.status : undefined,
        },
        error: error instanceof Error ? error : new Error(String(error)),
        label: "update-tokens Fastify validation failed",
        tags: { app: "web", module: "auth", route: "/api/auth/update-tokens" },
      });

      return new Response(
        JSON.stringify({ message: "Auth service unavailable" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 502,
        }
      );
    }

    const response = new NextResponse(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
    setAuthCookiesOnResponse(response, { refreshToken, token });
    return response;
  } catch (error) {
    captureError({
      data: { reqId },
      error: error instanceof Error ? error : new Error(String(error)),
      label: "update-tokens failed",
      tags: { app: "web", module: "auth", route: "/api/auth/update-tokens" },
    });
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to update tokens",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}
