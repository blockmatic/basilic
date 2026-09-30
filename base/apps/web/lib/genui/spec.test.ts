import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { statusSpec } from "./spec";

describe("starter genui", () => {
  it("keeps the welcome screen free of coin requests", () => {
    const source = readFileSync(
      new URL("../../components/welcome.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toContain("Your application is ready.");
    expect(source).not.toContain("/coins");
  });

  it("builds a status spec from a typed fixture", () => {
    const spec = statusSpec({
      status: { database: true, name: "Basilic", ok: true },
    });
    const element = spec.elements.status;
    expect(element?.type).toBe("StatusCard");
    expect(element?.props).toEqual({
      database: true,
      name: "Basilic",
      ok: true,
    });
  });
});
