import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { commandCatalog, commandComponentDefinitions } from "./catalog";
import { catalogFixtureSpec } from "./catalog-fixture";
import { accountSpec, statusSpec } from "./spec";

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

  it("validates account and status specs", () => {
    expect(
      commandCatalog.validate(
        statusSpec({
          status: { database: true, name: "Basilic", ok: true },
        })
      ).success
    ).toBe(true);
    expect(
      commandCatalog.validate(
        accountSpec({
          account: { email: "a@b.com", image: null, name: "User" },
        })
      ).success
    ).toBe(true);
  });

  it("validates a fixture that uses every catalog component", () => {
    const result = commandCatalog.validate(catalogFixtureSpec());
    expect(result.success).toBe(true);
  });

  it("keeps catalog component names aligned with definitions", () => {
    const definitionNames = Object.keys(commandComponentDefinitions).sort();
    const catalogNames = [...commandCatalog.componentNames].sort();
    expect(definitionNames).toEqual(catalogNames);
  });
});
