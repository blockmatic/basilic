#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const scriptDir = import.meta.dirname;
const workspaceRoot = dirname(scriptDir);

function git(args) {
  return spawnSync("git", args, {
    cwd: workspaceRoot,
    encoding: "utf8",
  });
}

const top = git(["rev-parse", "--show-toplevel"]);
if (top.status === 0) {
  const toplevel = top.stdout.trim();
  const hook = join(toplevel, ".githooks", "pre-commit");
  const aboveWorkspace =
    toplevel !== workspaceRoot &&
    !relative(toplevel, workspaceRoot).startsWith("..");
  if (aboveWorkspace && existsSync(hook)) {
    const configured = git([
      "config",
      "core.hooksPath",
      join(toplevel, ".githooks"),
    ]);
    process.exit(configured.status ?? 1);
  }
}

const install = spawnSync("npx", ["simple-git-hooks"], {
  cwd: workspaceRoot,
  stdio: "inherit",
});
process.exit(install.status ?? 1);
