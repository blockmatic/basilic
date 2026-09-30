import { describe, expect, it } from "vitest";

import { isAccountAsk, userIdFromAuth } from "./account-scope.js";

describe("isAccountAsk", () => {
  it("matches account prompts", () => {
    expect(isAccountAsk({ prompt: "who am I ?" })).toBe(true);
    expect(isAccountAsk({ prompt: "show my account" })).toBe(true);
    expect(isAccountAsk({ prompt: "what's my email" })).toBe(true);
  });

  it("leaves status prompts public", () => {
    expect(isAccountAsk({ prompt: "show application status" })).toBe(false);
    expect(isAccountAsk({ prompt: "what moved?" })).toBe(false);
  });
});

describe("userIdFromAuth", () => {
  it("returns a user principal id", () => {
    expect(
      userIdFromAuth({
        ctx: {
          session: {
            auth: { current: { principalId: "user-a", principalType: "user" } },
          },
        },
      })
    ).toBe("user-a");
  });

  it("rejects anonymous and missing principals", () => {
    expect(
      userIdFromAuth({
        ctx: {
          session: {
            auth: {
              current: { principalId: "anonymous", principalType: "anonymous" },
            },
          },
        },
      })
    ).toBeNull();
    expect(userIdFromAuth({ ctx: {} })).toBeNull();
  });
});
