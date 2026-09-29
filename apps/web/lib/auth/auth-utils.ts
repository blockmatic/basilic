import { z } from "zod";

import { env } from "@/lib/env";

import { getServerAuthToken } from "./auth-server";
import { isTokenExpired, verifyJwtToken } from "./jwt-utils";

const userResponseSchema = z
  .object({
    user: z
      .object({
        email: z.string().nullable().optional(),
        emailVerified: z.boolean().optional(),
        id: z.string(),
        name: z.string().nullable().optional(),
        username: z.string().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

export async function getAuthStatus(): Promise<{
  authenticated: boolean;
  userId: string | null;
  sessionId: string | null;
}> {
  const { token } = await getServerAuthToken();

  if (!token) {
    return { authenticated: false, userId: null, sessionId: null };
  }

  const decoded = await verifyJwtToken({
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
    secret: env.JWT_SECRET,
    token,
  });
  if (decoded?.typ !== "access" || !decoded.sub || !decoded.sid) {
    return { authenticated: false, userId: null, sessionId: null };
  }

  if (isTokenExpired({ token })) {
    return { authenticated: false, userId: null, sessionId: null };
  }

  return {
    authenticated: true,
    sessionId: decoded.sid,
    userId: decoded.sub,
  };
}

export async function getUserInfo(): Promise<{
  id?: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  emailVerified?: boolean;
} | null> {
  const { token } = await getServerAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/auth/session/user`,
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      }
    );

    if (!response.ok) {
      return null;
    }

    const parsed = userResponseSchema.safeParse(await response.json());
    return parsed.success && parsed.data.user ? parsed.data.user : null;
  } catch {
    return null;
  }
}
