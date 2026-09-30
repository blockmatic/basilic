import { authCookieSchema } from "./auth-schemas";

export function parseAuthCookie(value: string | undefined): {
  token: string | null;
  refreshToken: string | null;
} {
  if (!value) {
    return { token: null, refreshToken: null };
  }
  try {
    const parsed = authCookieSchema.safeParse(JSON.parse(value));
    return parsed.success
      ? { refreshToken: parsed.data.refreshToken, token: parsed.data.token }
      : { refreshToken: null, token: null };
  } catch {
    return { refreshToken: null, token: null };
  }
}
