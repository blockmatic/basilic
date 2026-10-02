import type { MessageStreamEvent } from "eve/client";

import { createAgentsClient } from "./client.js";
import { AgentError } from "./events.js";

const eve = vi.hoisted(() => ({
  cancel: vi.fn(async () => ({})),
  createError: undefined as unknown,
  created: [] as { auth: unknown; host: string; message: string }[],
  events: [] as unknown[],
  hang: false,
}));

vi.mock("eve/client", () => ({
  Client: class {
    readonly options: { auth: unknown; host: string };
    constructor(options: { auth: unknown; host: string }) {
      this.options = options;
    }
    get sessions() {
      return {
        create: async ({ message }: { message: string }) => {
          if (eve.createError) throw eve.createError;
          eve.created.push({ ...this.options, message });
          return {
            response: {
              cancel: eve.cancel,
              sessionId: "session-1",
              async *[Symbol.asyncIterator]() {
                for (const event of eve.events) yield event;
                if (eve.hang) await new Promise(() => undefined);
              },
            },
          };
        },
      };
    }
  },
}));

const endpoint = "https://agents.basilic.localhost/eve/operator";

function apiFetch({ status = 200, body }: { status?: number; body: unknown }) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
        status,
      })
  );
}

const events = [
  { data: { name: "system" }, type: "subagent.called" },
  {
    data: {
      result: {
        callId: "c1",
        kind: "tool-result",
        output: { status: "ok" },
        toolName: "system",
      },
      status: "completed",
    },
    type: "action.result",
  },
  {
    data: { output: "{}", subagentName: "system" },
    type: "subagent.completed",
  },
  { data: { messageDelta: "All " }, type: "message.appended" },
  { data: { messageDelta: "systems ok." }, type: "message.appended" },
  { data: {}, type: "step.started" },
] as unknown as MessageStreamEvent[];

beforeEach(() => {
  eve.created.length = 0;
  eve.createError = undefined;
  eve.events = events;
  eve.hang = false;
  eve.cancel.mockClear();
});

describe("createAgentsClient", () => {
  it("lists agents with the credential as bearer", async () => {
    const fetch = apiFetch({ body: [{ id: "operator" }] });
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost/",
      fetch,
      getCredential: () => "bask_p_s",
    });
    expect(await client.list()).toEqual([{ id: "operator" }]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.basilic.localhost/agents",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer bask_p_s" }),
      })
    );
  });

  it("surfaces problem fields as AgentError", async () => {
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: {
          code: "NOT_FOUND",
          message: "Agent not found",
          resolution: "Call GET /agents",
          retryable: false,
          traceId: "req-1",
        },
        status: 404,
      }),
      getCredential: () => "bask_p_s",
    });
    const error = await client.get({ agentId: "system" }).catch((e) => e);
    expect(error).toBeInstanceOf(AgentError);
    expect(error.problem).toMatchObject({
      code: "NOT_FOUND",
      resolution: "Call GET /agents",
      retryable: false,
      status: 404,
      traceId: "req-1",
    });
  });

  it("mints a token, streams eve with it, and aggregates the result", async () => {
    const fetch = apiFetch({
      body: {
        agentId: "operator",
        endpoint,
        expiresIn: 120,
        token: "agent-jwt",
      },
    });
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch,
      getCredential: () => "bask_p_s",
    });
    const result = await client.invoke({
      agentId: "operator",
      message: "status",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.basilic.localhost/agents/operator/token",
      expect.objectContaining({ method: "POST" })
    );
    expect(eve.created).toEqual([
      {
        auth: { bearer: "agent-jwt" },
        host: endpoint,
        message: "status",
        redirect: "error",
      },
    ]);
    expect(result).toEqual({
      actions: [{ isError: false, name: "system", output: { status: "ok" } }],
      agentId: "operator",
      sessionId: "session-1",
      text: "All systems ok.",
      type: "result",
    });
  });

  it("streams delegation, action, text, then result", async () => {
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: { agentId: "operator", endpoint, expiresIn: 120, token: "t" },
      }),
      getCredential: () => "bask_p_s",
    });
    const types: string[] = [];
    for await (const event of client.stream({
      agentId: "operator",
      message: "status",
    }))
      types.push(event.type);
    expect(types).toEqual([
      "delegation",
      "action",
      "delegation",
      "text",
      "text",
      "result",
    ]);
  });

  it("yields a structured error when the token exchange is rejected", async () => {
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: { code: "UNAUTHORIZED", message: "no", retryable: false },
        status: 401,
      }),
      getCredential: () => undefined,
    });
    const seen = [];
    for await (const event of client.stream({
      agentId: "operator",
      message: "x",
    }))
      seen.push(event);
    expect(seen).toEqual([
      {
        error: expect.objectContaining({ code: "UNAUTHORIZED", status: 401 }),
        type: "error",
      },
    ]);
    expect(eve.created).toHaveLength(0);
  });

  it("cancels the eve turn and reports TIMEOUT when timeoutMs elapses", async () => {
    eve.events = [];
    eve.hang = true;
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: { agentId: "operator", endpoint, expiresIn: 120, token: "t" },
      }),
      getCredential: () => "bask_p_s",
    });
    const error = await client
      .invoke({ agentId: "operator", message: "x", timeoutMs: 20 })
      .catch((e) => e);
    expect(error.problem).toMatchObject({ code: "TIMEOUT", retryable: true });
    expect(eve.cancel).toHaveBeenCalledOnce();
  });

  it("reports ABORTED when the caller aborts", async () => {
    eve.events = [];
    eve.hang = true;
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: { agentId: "operator", endpoint, expiresIn: 120, token: "t" },
      }),
      getCredential: () => "bask_p_s",
    });
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    const error = await client
      .invoke({ agentId: "operator", message: "x", signal: controller.signal })
      .catch((e) => e);
    expect(error.problem).toMatchObject({ code: "ABORTED" });
    expect(eve.cancel).toHaveBeenCalledOnce();
  });

  it("stops at a failed turn", async () => {
    eve.events = [
      { data: { code: "MODEL_ERROR", message: "boom" }, type: "turn.failed" },
      { data: { messageDelta: "late" }, type: "message.appended" },
    ];
    const client = createAgentsClient({
      baseUrl: "https://api.basilic.localhost",
      fetch: apiFetch({
        body: { agentId: "operator", endpoint, expiresIn: 120, token: "t" },
      }),
      getCredential: () => "bask_p_s",
    });
    const error = await client
      .invoke({ agentId: "operator", message: "x" })
      .catch((e) => e);
    expect(error.problem).toMatchObject({
      code: "MODEL_ERROR",
      message: "boom",
    });
  });

  it.each([
    {
      code: "AGENT_UNAVAILABLE",
      error: new TypeError("fetch failed"),
      retryable: true,
    },
    {
      code: "AGENT_REJECTED",
      error: Object.assign(new Error("Unauthorized"), { status: 401 }),
      retryable: true,
    },
    {
      code: "AGENT_REJECTED",
      error: Object.assign(new Error("Forbidden"), { status: 403 }),
      retryable: false,
    },
  ])(
    "maps an eve $code failure to a problem",
    async ({ code, error, retryable }) => {
      eve.createError = error;
      const client = createAgentsClient({
        baseUrl: "https://api.basilic.localhost",
        fetch: apiFetch({
          body: { agentId: "operator", endpoint, expiresIn: 120, token: "t" },
        }),
        getCredential: () => "bask_p_s",
      });
      const failure = await client
        .invoke({ agentId: "operator", message: "x" })
        .catch((e) => e);
      expect(failure.problem).toMatchObject({ code, retryable });
      expect(failure.problem.resolution).toBeTruthy();
    }
  );
});
