import type { MessageStreamEvent } from "eve/client";

export interface AgentProblem {
  code: string;
  message: string;
  resolution?: string;
  retryable: boolean;
  status?: number;
  traceId?: string;
}

export interface AgentAction {
  isError: boolean;
  name: string;
  output: unknown;
}

export type AgentStreamEvent =
  | { type: "text"; delta: string }
  | { type: "delegation"; phase: "started" | "completed"; agent: string }
  | ({ type: "action" } & AgentAction)
  | {
      type: "result";
      actions: AgentAction[];
      agentId: string;
      sessionId: string;
      text: string;
    }
  | { type: "error"; error: AgentProblem };

export class AgentError extends Error {
  readonly problem: AgentProblem;

  constructor({ problem }: { problem: AgentProblem }) {
    super(problem.message);
    this.name = "AgentError";
    this.problem = problem;
  }
}

/** Maps one eve stream event onto the public agent stream, or `null` for internal events. */
export function toAgentStreamEvent({
  event,
}: {
  event: MessageStreamEvent;
}): Exclude<AgentStreamEvent, { type: "result" }> | null {
  switch (event.type) {
    case "message.appended": {
      return { delta: event.data.messageDelta, type: "text" };
    }
    case "subagent.called": {
      return { agent: event.data.name, phase: "started", type: "delegation" };
    }
    case "subagent.completed": {
      return {
        agent: event.data.subagentName,
        phase: "completed",
        type: "delegation",
      };
    }
    case "action.result": {
      return event.data.result.kind === "tool-result"
        ? {
            isError: Boolean(event.data.result.isError),
            name: event.data.result.toolName,
            output: event.data.result.output,
            type: "action",
          }
        : null;
    }
    case "turn.failed":
    case "session.failed": {
      return {
        error: {
          code: event.data.code,
          message: event.data.message,
          retryable: false,
        },
        type: "error",
      };
    }
    case "turn.cancelled": {
      return {
        error: {
          code: "CANCELLED",
          message: "The agent turn was cancelled.",
          retryable: true,
        },
        type: "error",
      };
    }
    default: {
      return null;
    }
  }
}
