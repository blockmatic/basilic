#!/usr/bin/env node
/**
 * Run QA pipeline: install (if needed), checktypes, lint, OpenAPI drift and lint,
 * sherif, build, test:scripts, test, e2e.
 * Knip stays in lint.yml only. Stops on the first failure.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = import.meta.dirname;
const repoRoot = dirname(scriptDir);

const qaBuildEnv = process.env.JWT_SECRET
  ? undefined
  : { JWT_SECRET: "qa-build-placeholder-min-32-chars-to-pass-validation" };

const hasNodeModules = existsSync(join(repoRoot, "node_modules"));

const phases = [
  ...(hasNodeModules
    ? []
    : [{ args: ["i", "--frozen-lockfile"], cmd: "pnpm", name: "install" }]),
  {
    args: ["exec", "turbo", "run", "checktypes", "--concurrency=100%"],
    cmd: "pnpm",
    name: "checktypes",
  },
  { args: ["lint"], cmd: "pnpm", name: "lint" },
  { args: ["openapi:drift"], cmd: "pnpm", name: "openapi-drift" },
  { args: ["openapi:lint"], cmd: "pnpm", name: "openapi-lint" },
  { args: ["sherif"], cmd: "pnpm", name: "sherif" },
  {
    args: ["build"],
    cmd: "pnpm",
    env: { ...qaBuildEnv, NEXT_PUBLIC_API_URL: "http://localhost:3001" },
    name: "build",
  },
  {
    args: ["test:scripts"],
    cmd: "pnpm",
    name: "test:scripts",
  },
  {
    args: ["exec", "turbo", "run", "test", "--concurrency=100%"],
    cmd: "pnpm",
    name: "test",
  },
  {
    args: ["test:e2e"],
    cmd: "pnpm",
    env: {
      SKIP_BUILD: "1",
      ...qaBuildEnv,
      NEXT_PUBLIC_API_URL: "http://localhost:3001",
    },
    name: "test:e2e",
  },
];

for (const { name, cmd, args, env } of phases) {
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    env: { ...process.env, ...(env ?? {}) },
    stdio: "inherit",
  });
  if (result.status !== 0) {
    const code = result.status ?? 1;
    console.error(
      '\n---\nQA FAILED at phase "%s" (exit code %d)\n---\n',
      name,
      code
    );
    process.exit(code);
  }
}
