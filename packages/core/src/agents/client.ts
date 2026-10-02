import { Client } from "eve/client";

import {
  AgentError,
  toAgentStreamEvent,
  type AgentAction,
  type AgentProblem,
  type AgentStreamEvent,
} from "./events.js";

export interface AgentRecord {
  auth: string;
  capabilities: string[];
  delegatesTo?: string[];
  description: string;
  docs: string;
  endpoint: string;
  id: string;
  inputMode: string;
  name: string;
  outputMode: string;
  streaming: boolean;
  transport: string;
  version: string;
  visibility: string;
}

interface AgentTokenResponse {
  agentId: string;
  endpoint: string;
  expiresIn: number;
  token: string;
}

export interface AgentsClientOptions {
  /** Basilic API origin, e.g. `https://api.basilic.localhost`. */
  baseUrl: string;
  /** `bask_…` API key or access JWT. Only sent to the API, never to eve. */
  getCredential: () => string | undefined | Promise<string | undefined>;
  /** Used for API calls only; eve streams use the global `fetch`. */
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}

export interface AgentInvokeInput {
  agentId: string;
  message: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const defaultTimeoutMs = 120_000;

async function readProblem({
  response,
}: {
  response: Response;
}): Promise<AgentProblem> {
  const body = (await response.json().catch(() => ({}))) as Partial<
    AgentProblem & { detail: string; title: string }
  >;
  return {
    code: body.code ?? `HTTP_${response.status}`,
    message:
      body.message ?? body.detail ?? body.title ?? response.statusText ?? "",
    resolution: body.resolution,
    retryable: body.retryable ?? response.status >= 500,
    status: response.status,
    traceId: body.traceId ?? response.headers.get("x-request-id") ?? undefined,
  };
}

function abortProblem({ signal }: { signal: AbortSignal }): AgentProblem {
  const isTimeout =
    signal.reason instanceof DOMException &&
    signal.reason.name === "TimeoutError";
  return isTimeout
    ? {
        code: "TIMEOUT",
        message: "The agent did not finish before the timeout.",
        resolution: "Retry with a larger timeout or a narrower request.",
        retryable: true,
      }
    : {
        code: "ABORTED",
        message: "The caller aborted the request.",
        retryable: true,
      };
}

function eveProblem({
  endpoint,
  error,
}: {
  endpoint: string;
  error: unknown;
}): AgentProblem {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : undefined;
  if (!status)
    return {
      code: "AGENT_UNAVAILABLE",
      message: `Could not reach the agent at ${endpoint}.`,
      resolution:
        "Check that eve is running and that EVE_AGENTS_URL on the API points at it, then retry.",
      retryable: true,
    };
  return {
    code: "AGENT_REJECTED",
    message: error instanceof Error ? error.message : `eve returned ${status}.`,
    resolution:
      status === 401
        ? "Exchange a new agent token and retry."
        : "Retry; if it persists, check the eve deployment logs.",
    retryable: status === 401 || status === 429 || status >= 500,
    status,
  };
}

function nextOrAbort<T>({
  iterator,
  signal,
}: {
  iterator: AsyncIterator<T>;
  signal: AbortSignal;
}): Promise<IteratorResult<T> | "aborted"> {
  if (signal.aborted) return Promise.resolve("aborted");
  return new Promise((resolve, reject) => {
    const onAbort = () => resolve("aborted");
    signal.addEventListener("abort", onAbort, { once: true });
    iterator.next().then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

export function createAgentsClient({
  baseUrl,
  getCredential,
  fetch: fetchImpl = fetch,
}: AgentsClientOptions) {
  const apiUrl = ({ path }: { path: string }) =>
    `${baseUrl.replace(/\/$/, "")}${path}`;

  const request = async <T>({
    method = "GET",
    path,
    signal,
  }: {
    method?: string;
    path: string;
    signal?: AbortSignal;
  }): Promise<T> => {
    const credential = await getCredential();
    const response = await fetchImpl(apiUrl({ path }), {
      headers: {
        accept: "application/json",
        ...(credential && { authorization: `Bearer ${credential}` }),
      },
      method,
      signal,
    });
    if (!response.ok)
      throw new AgentError({ problem: await readProblem({ response }) });
    return (await response.json()) as T;
  };

  const list = ({ signal }: { signal?: AbortSignal } = {}) =>
    request<AgentRecord[]>({ path: "/agents", signal });

  const get = ({
    agentId,
    signal,
  }: {
    agentId: string;
    signal?: AbortSignal;
  }) =>
    request<AgentRecord>({
      path: `/agents/${encodeURIComponent(agentId)}`,
      signal,
    });

  async function* stream({
    agentId,
    message,
    signal,
    timeoutMs = defaultTimeoutMs,
  }: AgentInvokeInput): AsyncGenerator<AgentStreamEvent> {
    const combined = AbortSignal.any([
      AbortSignal.timeout(timeoutMs),
      ...(signal ? [signal] : []),
    ]);
    const minted = await request<AgentTokenResponse>({
      method: "POST",
      path: `/agents/${encodeURIComponent(agentId)}/token`,
      signal: combined,
    }).catch((error: unknown) => {
      if (error instanceof AgentError) return error;
      if (combined.aborted)
        return new AgentError({ problem: abortProblem({ signal: combined }) });
      throw error;
    });
    if (minted instanceof AgentError) {
      yield { error: minted.problem, type: "error" };
      return;
    }
    const eve = new Client({
      auth: { bearer: minted.token },
      host: minted.endpoint,
      redirect: "error",
    });
    const failure = (error: unknown): AgentStreamEvent => ({
      error: combined.aborted
        ? abortProblem({ signal: combined })
        : eveProblem({ endpoint: minted.endpoint, error }),
      type: "error",
    });
    const opened = await eve.sessions
      .create({ message, signal: combined })
      .catch((error: unknown) => failure(error));
    if ("type" in opened) {
      yield opened;
      return;
    }
    const { response } = opened;
    const iterator = response[Symbol.asyncIterator]();
    const actions: AgentAction[] = [];
    let text = "";
    while (true) {
      const next = await nextOrAbort({ iterator, signal: combined }).catch(
        (error: unknown) => failure(error)
      );
      if (typeof next === "object" && "type" in next) {
        yield next;
        return;
      }
      if (next === "aborted") {
        await response.cancel().catch(() => undefined);
        yield { error: abortProblem({ signal: combined }), type: "error" };
        return;
      }
      if (next.done) break;
      const event = toAgentStreamEvent({ event: next.value });
      if (!event) continue;
      if (event.type === "text") text += event.delta;
      if (event.type === "action")
        actions.push({
          isError: event.isError,
          name: event.name,
          output: event.output,
        });
      yield event;
      if (event.type === "error") return;
    }
    yield {
      actions,
      agentId,
      sessionId: response.sessionId,
      text,
      type: "result",
    };
  }

  const invoke = async (input: AgentInvokeInput) => {
    for await (const event of stream(input)) {
      if (event.type === "error")
        throw new AgentError({ problem: event.error });
      if (event.type === "result") return event;
    }
    throw new AgentError({
      problem: {
        code: "NO_RESULT",
        message: "The agent stream ended without a result.",
        retryable: true,
      },
    });
  };

  return { get, invoke, list, stream };
}

export type AgentsClient = ReturnType<typeof createAgentsClient>;
