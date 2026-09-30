import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  clearNextDevLocks,
  ensurePortlessProxy,
  envFlagIsTrue,
  parseNextDevLock,
  portlessProxyPort,
  shouldEnsurePortlessProxy,
  turboChildEnv,
  turboDevCommand,
} from "./dev.mjs";

test("envFlagIsTrue accepts 1 and true only", () => {
  assert.equal(envFlagIsTrue("true"), true);
  assert.equal(envFlagIsTrue("1"), true);
  assert.equal(envFlagIsTrue("false"), false);
  assert.equal(envFlagIsTrue(), false);
});

test("turboChildEnv sets SKIP_DB_START and named local URLs", () => {
  const env = turboChildEnv({ env: { PATH: "/bin" } });
  assert.equal(env.SKIP_DB_START, "1");
  assert.equal(env.NEXT_PUBLIC_API_URL, "https://api.tracker.localhost");
  assert.equal(env.NEXT_PUBLIC_APP_URL, "https://tracker.localhost");
  assert.equal(
    turboChildEnv({ env: { PATH: "/bin", SKIP_DB_START: "1" } }).SKIP_DB_START,
    "1"
  );
});

test("shouldEnsurePortlessProxy skips CI and PORTLESS bypass", () => {
  assert.equal(shouldEnsurePortlessProxy({ env: {} }), true);
  assert.equal(shouldEnsurePortlessProxy({ env: { CI: "1" } }), false);
  assert.equal(shouldEnsurePortlessProxy({ env: { PORTLESS: "0" } }), false);
  assert.equal(shouldEnsurePortlessProxy({ env: { PORTLESS: "skip" } }), false);
});

test("portlessProxyPort defaults to 443", () => {
  assert.equal(portlessProxyPort({ env: {} }), 443);
  assert.equal(portlessProxyPort({ env: { PORTLESS_PORT: "1355" } }), 1355);
  assert.equal(portlessProxyPort({ env: { PORTLESS_PORT: "nope" } }), 443);
});

test("ensurePortlessProxy does not spawn when the proxy is already up", async () => {
  const calls = [];
  const result = await ensurePortlessProxy({
    env: {},
    log: { error() {}, log() {} },
    responding: async () => true,
    spawn: (...args) => {
      calls.push(args);
      return { status: 0 };
    },
  });
  assert.deepEqual(result, { ok: true, skipped: true });
  assert.equal(calls.length, 0);
});

test("ensurePortlessProxy starts the proxy once when it is down", async () => {
  let probes = 0;
  const calls = [];
  const result = await ensurePortlessProxy({
    env: {},
    log: { error() {}, log() {} },
    responding: async () => {
      probes += 1;
      return probes > 1;
    },
    spawn: (cmd, args, options) => {
      calls.push({ cmd, args, options });
      return { status: 0 };
    },
  });
  assert.deepEqual(result, { ok: true, skipped: false });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [
    "exec",
    "portless",
    "proxy",
    "start",
    "--https",
    "--port",
    "443",
    "--skip-trust",
  ]);
  assert.equal(calls[0].options.stdio, "inherit");
  assert.deepEqual(calls[0].options.env, {});
  assert.equal(calls[0].options.shell, process.platform === "win32");
});

test("ensurePortlessProxy fails when proxy start exits non-zero", async () => {
  const errors = [];
  const result = await ensurePortlessProxy({
    env: {},
    log: { error: (msg) => errors.push(msg), log() {} },
    responding: async () => false,
    spawn: () => ({ status: 1 }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 1);
  assert.match(errors.join("\n"), /Failed to start the Portless proxy/);
});

test("turboDevCommand runs turbo dev at high concurrency", () => {
  assert.deepEqual(turboDevCommand({ extraArgs: ["--filter=@repo/api"] }), {
    args: [
      "exec",
      "turbo",
      "run",
      "dev",
      "--concurrency=20",
      "--filter=@repo/api",
    ],
    cmd: "pnpm",
  });
  assert.deepEqual(turboDevCommand(), {
    args: ["exec", "turbo", "run", "dev", "--concurrency=20"],
    cmd: "pnpm",
  });
});

test("parseNextDevLock reads a Next 16 lock pid", () => {
  assert.deepEqual(
    parseNextDevLock({
      text: JSON.stringify({ hostname: "localhost", pid: 97038, port: 4803 }),
    }),
    { pid: 97_038 }
  );
  assert.equal(parseNextDevLock({ text: "{" }), null);
});

test("clearNextDevLocks skips when SKIP_KILL_PORTS is set", async () => {
  const result = await clearNextDevLocks({
    delay: async () => {},
    env: { SKIP_KILL_PORTS: "1" },
  });
  assert.deepEqual(result, { skipped: true, stopped: [] });
});

test("clearNextDevLocks stops the pid recorded in a Next lock", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "basilic-next-lock-"));
  mkdirSync(join(cwd, "apps/docu/.next/dev"), { recursive: true });
  writeFileSync(
    join(cwd, "apps/docu/.next/dev/lock"),
    JSON.stringify({ hostname: "localhost", pid: 4242, port: 4803 })
  );
  const signals = [];
  const result = await clearNextDevLocks({
    cwd,
    delay: async () => {},
    env: {},
    kill: (pid, signal) => {
      if (signal === 0) {
        if (
          signals.some(
            (entry) => entry.pid === pid && entry.signal === "SIGTERM"
          )
        )
          throw new Error("ESRCH");
        return;
      }
      signals.push({ pid, signal });
    },
  });
  assert.deepEqual(result, { skipped: false, stopped: [4242] });
  assert.deepEqual(signals, [{ pid: 4242, signal: "SIGTERM" }]);
});
