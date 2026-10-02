import assert from "node:assert/strict";
import { test } from "node:test";

import { buildE2eSpawnEnv, defaultE2eEnv } from "./e2e-local-shared.mjs";

test("spawned e2e Fastify advertises loopback eve hosts", () => {
  assert.equal(defaultE2eEnv.EVE_AGENTS_URL, "http://127.0.0.1:3004");
  assert.equal(defaultE2eEnv.EVE_COMMAND_URL, "http://127.0.0.1:3004");
  const env = buildE2eSpawnEnv({
    loaded: {
      EVE_AGENTS_URL: "https://agents.basilic.localhost",
      EVE_COMMAND_URL: "https://agents.basilic.localhost/eve/operator",
    },
  });
  assert.equal(env.EVE_AGENTS_URL, "http://127.0.0.1:3004");
  assert.equal(env.EVE_COMMAND_URL, "http://127.0.0.1:3004");
});
