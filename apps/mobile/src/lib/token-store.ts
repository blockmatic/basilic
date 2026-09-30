const accessKey = "basilic.accessToken";
const refreshKey = "basilic.refreshToken";

export function createTokenStore({
  storage,
}: {
  storage: {
    get: ({ key }: { key: string }) => Promise<string | null>;
    remove: ({ key }: { key: string }) => Promise<void>;
    set: ({ key, value }: { key: string; value: string }) => Promise<void>;
  };
}) {
  return {
    async clear() {
      await storage.remove({ key: accessKey });
      await storage.remove({ key: refreshKey });
      return { cleared: true as const };
    },
    async read() {
      const token = await storage.get({ key: accessKey });
      const refreshToken = await storage.get({ key: refreshKey });
      return { refreshToken, token };
    },
    async write({
      refreshToken,
      token,
    }: {
      refreshToken: string;
      token: string;
    }) {
      await storage.set({ key: accessKey, value: token });
      await storage.set({ key: refreshKey, value: refreshToken });
      return { refreshToken, token };
    },
  };
}
