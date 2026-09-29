import { describe, expect, it } from "vitest";

import {
  boardQueryFromMessages,
  hasSetViewCall,
  lastUserPrompt,
} from "./select-model.js";

describe("select-model helpers", () => {
  it("skips boardQuery JSON when reading the last user prompt", () => {
    expect(
      lastUserPrompt({
        messages: [
          {
            role: "user",
            content: JSON.stringify({ boardQuery: { universe: "all" } }),
          },
          { role: "user", content: "what moved?" },
        ],
      })
    ).toBe("what moved?");
  });

  it("reads boardQuery from client context JSON", () => {
    expect(
      boardQueryFromMessages({
        messages: [
          {
            role: "user",
            content: JSON.stringify({ boardQuery: { sortBy: "volume" } }),
          },
        ],
      })
    ).toEqual({ sortBy: "volume" });
  });

  it("detects a set_view tool result", () => {
    expect(
      hasSetViewCall({
        messages: [
          {
            role: "tool",
            content: [{ type: "tool-result", toolName: "set_view" }],
          },
        ],
      })
    ).toBe(true);
  });

  it("returns account_required for an anonymous personal prompt", async () => {
    const { selectCommandLanguageModel } = await import("./select-model.js");
    const selected = await selectCommandLanguageModel({
      messages: [{ role: "user", content: "What are my gains?" }],
      ctx: {
        session: {
          auth: {
            current: { principalId: "anonymous", principalType: "anonymous" },
          },
        },
      },
    });
    expect(typeof selected.model).toBe("object");
    if (
      typeof selected.model === "object" &&
      selected.model &&
      "modelId" in selected.model
    )
      expect(selected.model.modelId).toBe("account-required");
  });
});
