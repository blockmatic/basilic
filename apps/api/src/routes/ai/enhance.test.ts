import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import {
  hasRealAnthropicKey,
  skipIfInsufficientCredits,
  skipIfProviderUnavailable,
} from "../../../test/utils/ai-remote.js";
import { createAuthenticatedUser } from "../../../test/utils/auth-helper.js";
import { fastify } from "./ai.spec.js";

const EnhanceResponseSchema = z.object({
  text: z.string().min(1),
});

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

describe("POST /ai/enhance", () => {
  let testToken: string;

  beforeEach(async () => {
    fastify.fakeEmail?.clear();
    const { token } = await createAuthenticatedUser(fastify);
    testToken = token;
  });

  describe("POST /ai/enhance — contract", () => {
    it("should return 401 when unauthenticated", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/ai/enhance",
        payload: { prompt: "develop a contex sales form" },
      });

      expect(response.statusCode).toBe(401);
      const data = JSON.parse(response.body);
      expect(() => ErrorSchema.parse(data)).not.toThrow();
      expect(data.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 for empty prompt", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/ai/enhance",
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: "" },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(() => ErrorSchema.parse(data)).not.toThrow();
      expect(data.code).toBe("BAD_REQUEST");
    });

    it("should return 400 for whitespace-only prompt", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/ai/enhance",
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: "   " },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(() => ErrorSchema.parse(data)).not.toThrow();
      expect(data.code).toBe("BAD_REQUEST");
    });

    it("should return 400 for missing prompt field", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/ai/enhance",
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(() => ErrorSchema.parse(data)).not.toThrow();
      expect(data.code).toBe("BAD_REQUEST");
    });
  });

  describe.skipIf(!hasRealAnthropicKey())("POST /ai/enhance — remote", () => {
    it("should return improved text for a messy draft", async (ctx) => {
      const response = await fastify.inject({
        method: "POST",
        url: "/ai/enhance",
        headers: { Authorization: `Bearer ${testToken}` },
        payload: { prompt: "develop a contex sales form" },
      });

      skipIfInsufficientCredits(ctx, response, "enhance");
      skipIfProviderUnavailable(ctx, response, "enhance");
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(() => EnhanceResponseSchema.parse(data)).not.toThrow();
      expect(data.text.length).toBeGreaterThan(10);
    }, 60000);
  });
});
