import { describe, expect, it } from "vitest";

import {
  createApiKey,
  getOrCreateSession,
  getSessionWithoutEmail,
  readLinkEmailToken,
} from "../../../../../test/utils/auth-helper.js";
import { fastify } from "../../account.spec.js";

describe("POST /account/link/email/request", () => {
  it("should return 401 without Bearer token", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/account/link/email/request",
      payload: {
        email: "link@example.com",
        callbackUrl: "https://example.com/callback",
      },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return EMAIL_ALREADY_SET when user already has email", async () => {
    const jwt = await getOrCreateSession(fastify, "link-email-set@test.ai", {
      clearBefore: true,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/account/link/email/request",
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: "another@test.ai",
        callbackUrl: "https://example.com/link-callback",
      },
    });
    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body).code).toBe("EMAIL_ALREADY_SET");
  });

  it("should send link email for a user without an inbox and return 200", async () => {
    const jwt = await getSessionWithoutEmail(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/account/link/email/request",
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: "linked@test.ai",
        callbackUrl: "https://example.com/link-callback",
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true });

    const linkToken = await readLinkEmailToken(fastify, jwt, "linked@test.ai");
    expect(linkToken).toBeTruthy();

    const sentEmail = fastify.fakeEmail?.last();
    expect(sentEmail).toBeDefined();
    expect(sentEmail?.to).toBe("linked@test.ai");
    expect(sentEmail?.subject).toBe("Link your email");
    const linkUrl = fastify.fakeEmail?.extractMagicLink(sentEmail);
    expect(linkUrl).toBeTruthy();
    expect(linkUrl).toContain("token=");
    expect(linkUrl).toContain("link-callback");
  });

  it("should return EMAIL_ALREADY_IN_USE when email belongs to another user", async () => {
    await getOrCreateSession(fastify, "other@test.ai", { clearBefore: true });

    const jwt = await getSessionWithoutEmail(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/account/link/email/request",
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: "other@test.ai",
        callbackUrl: "https://example.com/callback",
      },
    });
    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body.code).toBe("EMAIL_ALREADY_IN_USE");
  });

  it("should send link email when authenticated via API key for a user without an inbox", async () => {
    const jwt = await getSessionWithoutEmail(fastify);
    const userRes = await fastify.inject({
      method: "GET",
      url: "/auth/session/user",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user
      .id;
    const apiKey = await createApiKey(fastify, userId);

    const response = await fastify.inject({
      method: "POST",
      url: "/account/link/email/request",
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: {
        email: "link-apikey@test.ai",
        callbackUrl: "https://example.com/link-callback",
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true });
    const sentEmail = fastify.fakeEmail?.last();
    expect(sentEmail?.to).toBe("link-apikey@test.ai");
  });
});
