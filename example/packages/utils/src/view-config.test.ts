import { describe, expect, it } from "vitest";

import {
  defaultSearchQuery,
  parseViewConfig,
  viewFromSearchQuery,
} from "./view-config.js";

describe("viewConfigSchema", () => {
  it("parses the closed whoami board shape", () => {
    expect(
      parseViewConfig({
        value: viewFromSearchQuery({
          query: { ...defaultSearchQuery, universe: "watchlist" },
          title: "Your profile",
          surface: "account",
        }),
      })
    ).toMatchObject({ version: 1, surface: "account" });
  });

  it("parses optional elements on the closed ViewConfig", () => {
    expect(
      parseViewConfig({
        value: viewFromSearchQuery({
          query: defaultSearchQuery,
          title: "Board",
          elements: ["summary", "table-ranked"],
        }),
      })
    ).toMatchObject({ elements: ["summary", "table-ranked"] });
  });
});
