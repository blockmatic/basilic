import assert from "node:assert/strict";
import { test } from "node:test";

import { pnpmVersionMatches } from "./vercel-pnpm.mjs";

const pinned = "12.4.2";

function spawnStdout(stdout) {
  return () => ({ status: 0, stdout });
}

test("accepts the pinned pnpm version", () => {
  assert.equal(
    pnpmVersionMatches({
      argsPrefix: [],
      cmd: "pnpm",
      env: {},
      spawn: spawnStdout(`${pinned}\n`),
      version: pinned,
    }),
    true
  );
});

test("rejects a different major version", () => {
  assert.equal(
    pnpmVersionMatches({
      argsPrefix: [],
      cmd: "pnpm",
      env: {},
      spawn: spawnStdout("9.0.0\n"),
      version: pinned,
    }),
    false
  );
});
