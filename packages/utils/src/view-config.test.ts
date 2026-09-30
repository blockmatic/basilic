import { describe, expect, it } from "vitest";

import { parseViewConfig, viewFromCommand } from "./view-config.js";

describe("viewConfigSchema", () => {
  it("parses a status command", () => {
    expect(
      parseViewConfig({
        value: viewFromCommand({ q: "show status", surface: "status" }),
      })
    ).toEqual({ q: "show status", surface: "status", version: 1 });
  });

  it("rejects coin board fields", () => {
    expect(
      parseViewConfig({
        value: {
          query: { universe: "majors" },
          surface: "table",
          title: "Coins",
          version: 1,
        },
      })
    ).toBeNull();
  });
});
