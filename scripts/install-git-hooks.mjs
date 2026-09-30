#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

const workspaceRoot = dirname(import.meta.dirname);

const install = spawnSync("npx", ["simple-git-hooks"], {
  cwd: workspaceRoot,
  stdio: "inherit",
});
process.exit(install.status ?? 1);
