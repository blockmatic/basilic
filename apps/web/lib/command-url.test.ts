import { describe, expect, it } from "vitest";

import {
  commandFromPrompt,
  commandSearch,
  parseCommandSearch,
} from "./command-url";

describe("command url", () => {
  it("round-trips q and surface", () => {
    const search = commandSearch({
      q: "show application status",
      surface: "status",
    });
    expect(parseCommandSearch({ search })).toEqual({
      q: "show application status",
      surface: "status",
    });
  });

  it("maps an account prompt to the account surface", () => {
    expect(commandFromPrompt({ q: "show my account" }).surface).toBe("account");
  });
});
