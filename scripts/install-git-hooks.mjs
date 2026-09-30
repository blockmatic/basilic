#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

if (process.env.CI === "true") {
  process.exit(0);
}

const workspaceRoot = dirname(import.meta.dirname);
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const install = spawnSync(pnpm, ["exec", "simple-git-hooks"], {
  cwd: workspaceRoot,
  shell: process.platform === "win32",
  stdio: "inherit",
});
process.exit(install.status ?? 1);
