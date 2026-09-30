import { createClient } from "@repo/core";

import { requireApiUrl } from "./api-url.js";
import { secureTokenStore } from "./secure-store.js";

export function createSessionClient() {
  const { url } = requireApiUrl({ value: process.env.EXPO_PUBLIC_API_URL });
  return createClient({
    baseUrl: url,
    getAuthToken: async () => (await secureTokenStore.read()).token,
    getRefreshToken: async () => (await secureTokenStore.read()).refreshToken,
    onTokensRefreshed: async ({ refreshToken, token }) => {
      await secureTokenStore.write({ refreshToken, token });
    },
  });
}

export async function requestMagicLink({ email }: { email: string }) {
  const client = createSessionClient();
  return client.auth.magiclink.request({
    body: { callbackUrl: "basilic://auth/callback", email },
  });
}

export async function verifyMagicLink({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const client = createSessionClient();
  const tokens = await client.auth.magiclink.verify({
    body: { email, token },
  });
  if (!tokens.token || !tokens.refreshToken) {
    throw new Error("Magic link verification did not return tokens");
  }
  await secureTokenStore.write({
    refreshToken: tokens.refreshToken,
    token: tokens.token,
  });
  return { refreshToken: tokens.refreshToken, token: tokens.token };
}

export async function loadCurrentUser() {
  const client = createSessionClient();
  return client.auth.session.user();
}

export async function logoutSession() {
  const client = createSessionClient();
  await client.auth.session.logout();
  return secureTokenStore.clear();
}
