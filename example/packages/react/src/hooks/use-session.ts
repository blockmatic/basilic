import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { decodeJwt } from "jose";

import { useReactApiConfig } from "../context";

export interface DecodedSession {
  typ: string;
  sub: string;
  sid: string;
  wal?: { chain: string; address: string };
  iss?: string;
  aud?: string[];
  iat?: number;
  exp?: number;
}

function decodeSession(token: string | null): DecodedSession | null {
  if (!token) {
    return null;
  }
  try {
    const d = decodeJwt(token) as Record<string, unknown>;
    if (
      d.typ !== "access" ||
      typeof d.sub !== "string" ||
      typeof d.sid !== "string"
    ) {
      return null;
    }
    const session: DecodedSession = {
      sid: d.sid,
      sub: d.sub,
      typ: d.typ as string,
    };
    const { wal } = d;
    if (wal && typeof wal === "object" && "chain" in wal && "address" in wal) {
      session.wal = {
        chain: String((wal as { chain: unknown }).chain),
        address: String((wal as { address: unknown }).address),
      };
    }

    if (typeof d.iss === "string") {
      session.iss = d.iss;
    }
    if (Array.isArray(d.aud)) {
      session.aud = d.aud as string[];
    }
    if (typeof d.iat === "number") {
      session.iat = d.iat;
    }
    if (typeof d.exp === "number") {
      session.exp = d.exp;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Hook that returns decoded JWT access token claims.
 *
 * Uses getAuthToken from ReactApiProvider config to obtain the token,
 * then decodes it and returns session data (userId, sessionId, etc.).
 * Returns null when not authenticated or when getAuthToken is not configured.
 *
 * @param options - TanStack Query options. Default: retry: false
 * @returns Query result with DecodedSession or null
 *
 * @example
 * ```tsx
 * function SessionInfo() {
 *   const { data: session } = useSession()
 *
 *   if (!session) return <span>Signed out</span>
 *   return <span>User: {session.sub}, Session: {session.sid}</span>
 * }
 * ```
 */
export function useSession(
  options?: Omit<
    UseQueryOptions<DecodedSession | null, Error>,
    "queryKey" | "queryFn"
  >
) {
  const { getAuthToken, queryClientDefaults } = useReactApiConfig();

  return useQuery<DecodedSession | null, Error>({
    queryFn: async () => {
      if (!getAuthToken) return null;
      const token = await getAuthToken();
      return decodeSession(token ?? null);
    },
    queryKey: ["auth", "session", "jwt"],
    retry: false,
    ...queryClientDefaults,
    ...options,
  });
}
