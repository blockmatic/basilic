import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { AgentError, createAgentsClient } from "@repo/core/agents";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

const credentialHeaders = ["authorization", "x-api-key"] as const;

/** Runs the client's API calls through Fastify with the caller's own credential headers. */
function injectFetch({
  fastify,
  headers,
}: {
  fastify: FastifyInstance;
  headers: Headers;
}) {
  const auth = Object.fromEntries(
    credentialHeaders.flatMap((name) => {
      const value = headers.get(name);
      return value ? [[name, value]] : [];
    })
  );
  return async (url: string, init: RequestInit) => {
    const { pathname, search } = new URL(url);
    const response = await fastify.inject({
      headers: { ...auth, accept: "application/json" },
      method: (init.method ?? "GET") as "GET" | "POST",
      url: `${pathname}${search}`,
    });
    const responseHeaders = new Headers();
    for (const [name, value] of Object.entries(response.headers))
      if (value !== undefined) responseHeaders.set(name, String(value));
    return new Response(response.body, {
      headers: responseHeaders,
      status: response.statusCode,
    });
  };
}

const toResult = (value: Record<string, unknown>): CallToolResult => ({
  content: [{ text: JSON.stringify(value), type: "text" }],
  structuredContent: value,
});

const toProblemResult = (error: unknown): CallToolResult => {
  if (!(error instanceof AgentError)) throw error;
  return { ...toResult({ error: error.problem }), isError: true };
};

export function createAgentsMcpServer({
  fastify,
  headers,
}: {
  fastify: FastifyInstance;
  headers: Headers;
}): McpServer {
  const agents = createAgentsClient({
    baseUrl: "http://fastify.inject",
    fetch: injectFetch({ fastify, headers }),
    getCredential: () => undefined,
  });
  const server = new McpServer({ name: "basilic-agents", version: "1.0.0" });

  server.registerTool(
    "agents_list",
    {
      annotations: { readOnlyHint: true },
      description:
        "List public Basilic agents (id, description, capabilities). Pick an id for agents_get or agent_invoke.",
    },
    async (ctx) =>
      agents
        .list({ signal: ctx.mcpReq.signal })
        .then((rows) => toResult({ agents: rows }), toProblemResult)
  );

  server.registerTool(
    "agents_get",
    {
      annotations: { readOnlyHint: true },
      description: "Describe one public agent by id.",
      inputSchema: z.object({ agentId: z.string().min(1) }),
    },
    async ({ agentId }, ctx) =>
      agents
        .get({ agentId, signal: ctx.mcpReq.signal })
        .then((row) => toResult({ agent: row }), toProblemResult)
  );

  server.registerTool(
    "agent_invoke",
    {
      description:
        "Send one message to a public agent and wait for its reply. Returns the text, actions, and session id. Failures return a problem with code, resolution, retryable, and traceId.",
      inputSchema: z.object({
        agentId: z.string().min(1),
        message: z.string().min(1).max(4000),
        timeoutMs: z.number().int().min(1000).max(300_000).optional(),
      }),
    },
    async ({ agentId, message, timeoutMs }, ctx) =>
      agents
        .invoke({ agentId, message, signal: ctx.mcpReq.signal, timeoutMs })
        .then(
          ({ actions, sessionId, text }) =>
            toResult({ actions, agentId, sessionId, text }),
          toProblemResult
        )
  );

  return server;
}
