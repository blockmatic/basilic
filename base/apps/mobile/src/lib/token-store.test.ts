import { describe, expect, it } from "vitest";

import { createTokenStore } from "./token-store.js";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    async get({ key }: { key: string }) {
      return values.get(key) ?? null;
    },
    async remove({ key }: { key: string }) {
      values.delete(key);
    },
    async set({ key, value }: { key: string; value: string }) {
      values.set(key, value);
    },
  };
}

describe("createTokenStore", () => {
  it("writes, reads, and clears a token pair", async () => {
    const store = createTokenStore({ storage: memoryStorage() });
    await store.write({ refreshToken: "refresh", token: "access" });
    expect(await store.read()).toEqual({
      refreshToken: "refresh",
      token: "access",
    });
    expect(await store.clear()).toEqual({ cleared: true });
    expect(await store.read()).toEqual({ refreshToken: null, token: null });
  });
});
