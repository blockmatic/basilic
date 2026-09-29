import { describe, expect, it } from "vitest";

import {
  defaultSearchQuery,
  setViewInputSchema,
  viewFromSearchQuery,
} from "./view-config.js";

describe("setViewInputSchema", () => {
  it("strips elements so the command tool cannot commit candidate ids", () => {
    const parsed = setViewInputSchema.parse({
      viewConfig: {
        ...viewFromSearchQuery({
          query: defaultSearchQuery,
          title: "Board",
          elements: ["summary", "table-ranked"],
        }),
      },
    });
    expect(parsed.viewConfig).not.toHaveProperty("elements");
  });
});
