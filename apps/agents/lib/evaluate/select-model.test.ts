import { describe, expect, it } from "vitest";

import { lastUserPrompt, selectCommandLanguageModel } from "./select-model.js";

describe("select-model", () => {
  it("reads the last user prompt", () => {
    expect(
      lastUserPrompt({
        messages: [
          { role: "user", content: "show application status" },
          { role: "user", content: "show my account" },
        ],
      })
    ).toBe("show my account");
  });

  it("returns account_required for an anonymous account prompt", async () => {
    const selected = await selectCommandLanguageModel({
      messages: [{ role: "user", content: "show my account" }],
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
