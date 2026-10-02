import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { eveAgentIds } from "../apps/agents/scripts/dev-workspace.mjs";

const repoRoot = join(import.meta.dirname, "..");

const catalogIds = () => {
  const source = readFileSync(
    join(repoRoot, "apps/api/src/lib/agents/registry.ts"),
    "utf8"
  );
  const match = source.match(/publicAgentIds = \[([^\]]*)\] as const/);
  assert.ok(match, "publicAgentIds literal not found in the API registry");
  return [...match[1].matchAll(/"([^"]+)"/g)].map(([, id]) => id);
};

const memberIds = () =>
  readdirSync(join(repoRoot, "apps/agents/agents"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

test("public catalog, eve workspace ids, and member directories match", () => {
  const expected = ["ask", "operator"];
  assert.deepEqual(catalogIds().toSorted(), expected);
  assert.deepEqual(eveAgentIds.toSorted(), expected);
  assert.deepEqual(memberIds().toSorted(), expected);
});
