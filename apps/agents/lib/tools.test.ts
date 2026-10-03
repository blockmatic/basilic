import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("command tools", () => {
  it("keeps PGLite and Postgres packages external", () => {
    const source = readFileSync(
      new URL("../agents/operator/agent/agent.ts", import.meta.url),
      "utf8"
    );
    expect(source).not.toContain("#lib/host");
    expect(source).toContain(
      'externalDependencies: ["@repo/db", "@electric-sql/pglite", "pg"]'
    );
  });

  it("returns required when the current user tool has no principal", () => {
    const source = readFileSync(
      new URL(
        "../agents/operator/agent/subagents/account/tools/get_current_user.ts",
        import.meta.url
      ),
      "utf8"
    );
    expect(source).toContain("return { required: true }");
    expect(source).not.toContain("@repo/markets");
  });
});
