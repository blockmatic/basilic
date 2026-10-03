import type { AddressInfo } from "node:net";

import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { beforeAll, describe, expect, it } from "vitest";

import { getOrCreateSession } from "../../test/utils/auth-helper.js";
import { env } from "../lib/env.js";
import { fastify } from "./agents/agents.spec.js";

let origin = "";

async function createKey() {
  const jwt = await getOrCreateSession(fastify, "agents-mcp@test.ai");
  const response = await fastify.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "POST",
    payload: { name: "MCP" },
    url: "/account/apikeys",
  });
  return (response.json() as { key: string }).key;
}

async function connect({ key }: { key: string }) {
  const client = new Client({ name: "basilic-mcp-test", version: "1.0.0" });
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${origin}/mcp`), {
      requestInit: { headers: { "X-API-Key": key } },
    })
  );
  return client;
}

describe("/mcp", () => {
  beforeAll(async () => {
    await fastify.listen({ host: "127.0.0.1", port: 0 });
    origin = `http://127.0.0.1:${(fastify.server.address() as AddressInfo).port}`;
  });

  it("rejects a missing credential like GET /agents/:agentId", async () => {
    const [mcp, get] = await Promise.all([
      fetch(`${origin}/mcp`, {
        body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "tools/list" }),
        headers: {
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
        },
        method: "POST",
      }),
      fetch(`${origin}/agents/operator`),
    ]);
    expect(mcp.status).toBe(401);
    expect(await mcp.json()).toMatchObject({
      code: (await get.json()).code,
      retryable: false,
    });
  });

  // Spawned tests run no eve, so invoke proves discovery and the per-id token exchange up to the eve boundary.
  it("lists public agents and invokes each id with an API key", async () => {
    const key = await createKey();
    const client = await connect({ key });

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).toSorted()).toEqual([
      "agent_invoke",
      "agents_get",
      "agents_list",
    ]);

    const listed = await client.callTool({
      arguments: {},
      name: "agents_list",
    });
    const ids = (
      listed.structuredContent as { agents: { id: string }[] }
    ).agents.map((agent) => agent.id);
    expect(ids.toSorted()).toEqual(["ask", "operator"]);

    for (const agentId of ids) {
      const result = await client.callTool({
        arguments: { agentId, message: `hello ${agentId}` },
        name: "agent_invoke",
      });
      expect(result.isError).toBe(true);
      expect(result.structuredContent).toMatchObject({
        error: {
          code: "AGENT_UNAVAILABLE",
          message: `Could not reach the agent at ${env.EVE_AGENTS_URL}/eve/${agentId}.`,
          retryable: true,
        },
      });
    }
    await client.close();
  });

  it("returns private specialists as a NOT_FOUND problem", async () => {
    const client = await connect({ key: await createKey() });
    const result = await client.callTool({
      arguments: { agentId: "system" },
      name: "agents_get",
    });
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({
      error: { code: "NOT_FOUND", retryable: false, status: 404 },
    });
    await client.close();
  });
});
