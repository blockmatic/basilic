import { Writable } from "node:stream";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";

import { getOrCreateSession } from "../../../test/utils/auth-helper.js";
import app from "../../app.js";
import { env } from "../../lib/env.js";
import { createApiLoggerOptions } from "../../lib/http-logging.js";
import { fastify } from "./agents.spec.js";

function decodeClaims({ token }: { token: string }): Record<string, unknown> {
  return JSON.parse(
    Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf-8")
  ) as Record<string, unknown>;
}

async function createKey({ jwt }: { jwt: string }) {
  const response = await fastify.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "POST",
    payload: { name: "Agent token" },
    url: "/account/apikeys",
  });
  return response.json() as { id: string; key: string };
}

function exchange({
  agentId,
  headers,
}: {
  agentId: string;
  headers?: Record<string, string>;
}) {
  return fastify.inject({
    headers,
    method: "POST",
    url: `/agents/${agentId}/token`,
  });
}

describe("POST /agents/:agentId/token", () => {
  it("exchanges an API key for an operator token bound to the key", async () => {
    const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
    const { id, key } = await createKey({ jwt });
    const response = await exchange({
      agentId: "operator",
      headers: { "X-API-Key": key },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      agentId: string;
      endpoint: string;
      expiresIn: number;
      token: string;
    };
    expect(body.agentId).toBe("operator");
    expect(body.endpoint.endsWith("/eve/operator")).toBe(true);
    expect(body.expiresIn).toBe(120);
    const claims = decodeClaims({ token: body.token });
    expect(claims).toMatchObject({
      agent: "operator",
      akid: id,
      aud: env.AGENT_JWT_AUDIENCE,
      iss: env.JWT_ISSUER,
      typ: "agent",
    });
    expect(claims.aud).not.toEqual(env.JWT_AUDIENCE);
    expect(Number(claims.exp) - Number(claims.iat)).toBe(120);
    expect(claims).not.toHaveProperty("sid");
    expect(body.token).not.toContain(key);
    expect(JSON.stringify(claims)).not.toContain(key.split("_").at(-1));
  });

  it("mints an ask token from a browser session without akid", async () => {
    const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
    const response = await exchange({
      agentId: "ask",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    expect(response.statusCode).toBe(200);
    const claims = decodeClaims({ token: response.json().token });
    expect(claims).toMatchObject({ agent: "ask", typ: "agent" });
    expect(claims).not.toHaveProperty("akid");
    expect(claims).not.toHaveProperty("sid");
  });

  it("rejects anonymous callers with a next step", async () => {
    const response = await exchange({ agentId: "operator" });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      code: "UNAUTHORIZED",
      retryable: false,
    });
  });

  it("rejects a revoked key", async () => {
    const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
    const { id, key } = await createKey({ jwt });
    await fastify.inject({
      headers: { Authorization: `Bearer ${jwt}` },
      method: "DELETE",
      url: `/account/apikeys/${id}`,
    });
    const response = await exchange({
      agentId: "operator",
      headers: { Authorization: `Bearer ${key}` },
    });
    expect(response.statusCode).toBe(401);
  });

  it.each(["nope", "system", "account"])(
    "returns 404 for %s",
    async (agentId) => {
      const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
      const response = await exchange({
        agentId,
        headers: { Authorization: `Bearer ${jwt}` },
      });
      expect(response.statusCode).toBe(404);
      expect(response.json().code).toBe("NOT_FOUND");
    }
  );

  it("is not accepted as a Fastify access token", async () => {
    const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
    const { token } = (
      await exchange({
        agentId: "operator",
        headers: { Authorization: `Bearer ${jwt}` },
      })
    ).json() as { token: string };
    const response = await fastify.inject({
      headers: { Authorization: `Bearer ${token}` },
      method: "GET",
      url: "/agents/operator",
    });
    expect(response.statusCode).toBe(401);
  });

  it("keeps the key and the minted token out of logs", async () => {
    const lines: string[] = [];
    const logged = Fastify({
      ...createApiLoggerOptions({ level: "info" }),
      logger: {
        ...createApiLoggerOptions({ level: "info" }).logger,
        stream: new Writable({
          write(chunk, _encoding, callback) {
            lines.push(String(chunk));
            callback();
          },
        }),
      },
    }).withTypeProvider<TypeBoxTypeProvider>();
    await logged.register(app);
    await logged.ready();
    const jwt = await getOrCreateSession(fastify, "agents-token@test.ai");
    const { key } = await createKey({ jwt });
    const response = await logged.inject({
      headers: { "X-API-Key": key },
      method: "POST",
      url: "/agents/operator/token",
    });
    await logged.close();
    const output = lines.join("\n");
    expect(response.statusCode).toBe(200);
    expect(output).toContain("agent_token_issued");
    expect(output).not.toContain(key);
    expect(output).not.toContain(response.json().token);
  });
});
