import { describe, expect, it } from "vitest";

import { rewriteFilePointers } from "./pointers.js";

describe("rewriteFilePointers", () => {
  it("rewrites canonical docs pointers to the local snapshot", () => {
    const next = rewriteFilePointers({
      content: [
        "Read [`apps/docu/content/docs/`](apps/docu/content/docs/) ",
        "and `_first/basilic/DESIGN.md`.",
        "Also ../docu/content/docs/testing/product-ready.mdx",
      ].join("\n"),
    });
    expect(next).toContain("https://basilic-docs.vercel.app/docs/");
    expect(next).toContain("DESIGN.md");
    expect(next).not.toContain("apps/docu/content/docs/");
    expect(next).not.toContain("_first/");
    expect(next).toContain(
      "https://basilic-docs.vercel.app/docs/testing/product-ready"
    );
  });
});
