import type { MockModelRequest } from "eve/evals";
import { describe, expect, it } from "vitest";

import {
  operatorBriefs,
  scriptedAccount,
  scriptedAsk,
  scriptedOperator,
  scriptedSystem,
} from "./scripted.js";

function request({
  message,
  results = [],
}: {
  message: string;
  results?: { name: string; output: unknown }[];
}): MockModelRequest {
  return {
    lastUserMessage: message,
    messages: [],
    toolResults: results.map((result, index) => ({
      ...result,
      id: `call-${index}`,
      isError: false,
    })),
    tools: [],
    userMessageCount: 1,
    userMessages: [message],
  };
}

describe("scriptedOperator", () => {
  it("delegates status asks to system with a fixed brief, not the transcript", () => {
    expect(
      scriptedOperator(request({ message: "is the app healthy?" }))
    ).toEqual({
      toolCalls: [
        { input: { task: operatorBriefs.system }, name: "consult_system" },
      ],
    });
  });

  it("delegates account asks to account", () => {
    expect(scriptedOperator(request({ message: "who am I" }))).toEqual({
      toolCalls: [
        { input: { task: operatorBriefs.account }, name: "consult_account" },
      ],
    });
  });

  it("commits the view after the specialist returns, then replies with its summary", () => {
    const delegated = {
      name: "consult_account",
      output: { status: "required", summary: "Sign in to view your account." },
    };
    expect(
      scriptedOperator(request({ message: "who am I", results: [delegated] }))
    ).toEqual({
      toolCalls: [
        {
          input: { q: "who am I", surface: "account", version: 1 },
          name: "set_view",
        },
      ],
    });
    expect(
      scriptedOperator(
        request({
          message: "who am I",
          results: [delegated, { name: "set_view", output: {} }],
        })
      )
    ).toEqual({ text: "Sign in to view your account." });
  });
});

describe("specialists", () => {
  it("system reads status then returns a structured result", () => {
    expect(scriptedSystem(request({ message: "brief" }))).toEqual({
      toolCalls: [{ name: "get_application_status" }],
    });
    expect(
      scriptedSystem(
        request({
          message: "brief",
          results: [
            {
              name: "get_application_status",
              output: { database: true, name: "Basilic", ok: true },
            },
          ],
        })
      ).toolCalls?.[0]
    ).toEqual({
      input: {
        data: { database: true, name: "Basilic", ok: true },
        status: "ok",
        summary: "Basilic is healthy; database ready.",
      },
      name: "final_output",
    });
  });

  it("account reports required for anonymous callers", () => {
    expect(
      scriptedAccount(
        request({
          message: "brief",
          results: [{ name: "get_current_user", output: { required: true } }],
        })
      ).toolCalls?.[0]?.input
    ).toEqual({ status: "required", summary: "Sign in to view your account." });
  });

  it("ask replies in text only", () => {
    expect(scriptedAsk(request({ message: "hello" }))).toContain('"hello"');
  });
});
