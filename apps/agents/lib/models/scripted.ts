import type { MockModelRequest, MockModelResponse } from "eve/evals";

import { isAccountAsk } from "../account-scope.js";

type Output = { status?: string; summary?: string; [key: string]: unknown };

const resultOf = ({
  request,
  name,
}: {
  request: MockModelRequest;
  name: string;
}) => [...request.toolResults].reverse().find((result) => result.name === name);

const outputOf = ({ value }: { value: unknown }): Output =>
  typeof value === "object" && value !== null ? (value as Output) : {};

export const operatorBriefs = {
  account: "Read the signed-in account (email, name, image) for the caller.",
  system: "Report application status and database readiness.",
};

/** Routes to one specialist with a fixed brief, commits the view, then replies with the summary. */
export function scriptedOperator(request: MockModelRequest): MockModelResponse {
  const ask = request.lastUserMessage ?? "";
  const surface = isAccountAsk({ prompt: ask }) ? "account" : "status";
  const specialist = surface === "account" ? "account" : "system";
  const delegated = resultOf({ name: `consult_${specialist}`, request });
  if (!delegated)
    return {
      toolCalls: [
        {
          input: { task: operatorBriefs[specialist] },
          name: `consult_${specialist}`,
        },
      ],
    };
  if (!resultOf({ name: "set_view", request }))
    return {
      toolCalls: [
        { input: { q: ask.trim(), surface, version: 1 }, name: "set_view" },
      ],
    };
  return {
    text:
      outputOf({ value: delegated.output }).summary ??
      `The ${specialist} specialist did not return a summary.`,
  };
}

export function scriptedSystem(request: MockModelRequest): MockModelResponse {
  const status = resultOf({ name: "get_application_status", request });
  if (!status) return { toolCalls: [{ name: "get_application_status" }] };
  const { database, name, ok } = outputOf({ value: status.output });
  return {
    toolCalls: [
      {
        input: {
          data: { database: Boolean(database), name, ok: Boolean(ok) },
          status: ok ? "ok" : "error",
          summary: `${String(name)} is ${ok ? "healthy" : "degraded"}; database ${database ? "ready" : "unavailable"}.`,
        },
        name: "final_output",
      },
    ],
  };
}

export function scriptedAccount(request: MockModelRequest): MockModelResponse {
  const user = resultOf({ name: "get_current_user", request });
  if (!user) return { toolCalls: [{ name: "get_current_user" }] };
  const account = outputOf({ value: user.output });
  return {
    toolCalls: [
      {
        input: account.required
          ? { status: "required", summary: "Sign in to view your account." }
          : {
              data: { email: account.email, name: account.name },
              status: "ok",
              summary: `Signed in as ${String(account.email)}.`,
            },
        name: "final_output",
      },
    ],
  };
}

export function scriptedAsk(request: MockModelRequest): string {
  return `Ask is running without a language model, so this reply is scripted. Set AI_GATEWAY_API_KEY in apps/agents/.env for real answers. You said: "${request.lastUserMessage ?? ""}"`;
}
