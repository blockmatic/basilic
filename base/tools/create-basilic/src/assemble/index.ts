import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

import { digestTree } from "../digest.js";
import {
  assertCleanWorktree,
  extractHeadArchive,
  gitHeadSha,
  listTrackedFiles,
  listUntrackedFiles,
} from "../git.js";
import { classifyTrackedFiles, loadManifest } from "./classify.js";
import { regenerateLockfile } from "./lockfile.js";
import { rewritePointers } from "./pointers.js";
import { resetProductBrief } from "./product-reset.js";
import { applyAssembleTransforms } from "./transforms.js";

export const forbiddenGeneratedPaths = [
  "apps/docu",
  "tools/create-basilic",
  "scripts/prepare-publish.mjs",
  "scripts/restore-publish.mjs",
  "_first",
  ".agents/skills/f",
  "release-please-config.json",
  ".release-please-manifest.json",
  ".github/workflows/release-please.yml",
  ".github/workflows/publish-create-basilic.yml",
];

export const agentReadPaths = [
  "AGENTS.md",
  ".agents/rules/always.md",
  ".cursor/rules/base/general.mdc",
  ".cursor/rules/base/file-organization.mdc",
  ".cursor/rules/base/naming.mdc",
  ".cursor/rules/base/docs.mdc",
  "skills-lock.json",
  "PRODUCT.md",
  "ARCHITECTURE.md",
];

export function assembleTemplate({
  repoRoot,
  dest,
  lockfile = false,
  allowDirty = false,
}: {
  repoRoot: string;
  dest: string;
  lockfile?: boolean;
  allowDirty?: boolean;
}) {
  if (!allowDirty) {
    assertCleanWorktree({ repoRoot });
  }

  const manifest = loadManifest();
  const tracked = listTrackedFiles({ repoRoot });
  const files = allowDirty
    ? [...new Set([...tracked, ...listUntrackedFiles({ repoRoot })])]
    : tracked;
  const { classified, unclassified } = classifyTrackedFiles({
    files,
    manifest,
  });
  if (unclassified.length > 0) {
    const preview = unclassified.slice(0, 20).join("\n");
    throw new Error(
      `Unclassified tracked paths (${unclassified.length}). Add include/transform/exclude rules.\n${preview}`
    );
  }

  mkdirSync(dest, { recursive: true });

  if (allowDirty) {
    copyClassifiedFromWorktree({ classified, dest, repoRoot });
  } else {
    extractHeadArchive({ dest, repoRoot });
    for (const { path, kind } of classified) {
      if (kind !== "exclude") {
        continue;
      }
      rmSync(join(dest, path), { force: true, recursive: true });
    }
  }

  applyAssembleTransforms({ destRoot: dest });
  resetProductBrief({ destRoot: dest });
  rewritePointers({ destRoot: dest });
  if (lockfile) {
    regenerateLockfileOutsideWorkspace({ dest, repoRoot });
  }

  const digest = digestTree({ root: dest });
  const sourceSha = gitHeadSha({ repoRoot });
  writeFileSync(
    join(dest, ".basilic-template.json"),
    `${JSON.stringify(
      {
        digest,
        files: classified.filter((row) => row.kind !== "exclude").length,
        sourceSha,
      },
      null,
      2
    )}\n`
  );

  return { classified, digest, sourceSha, unclassified };
}

function regenerateLockfileOutsideWorkspace({
  dest,
  repoRoot,
}: {
  dest: string;
  repoRoot: string;
}) {
  const destResolved = resolve(dest);
  const repoResolved = resolve(repoRoot);
  const nested =
    destResolved === repoResolved ||
    destResolved.startsWith(`${repoResolved}${sep}`);
  if (!nested) {
    regenerateLockfile({ destRoot: dest });
    return;
  }
  const staging = join(tmpdir(), `create-basilic-lock-${process.pid}`);
  rmSync(staging, { force: true, recursive: true });
  cpSync(dest, staging, { recursive: true });
  regenerateLockfile({ destRoot: staging });
  rmSync(dest, { force: true, recursive: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(staging, dest, { recursive: true });
  rmSync(staging, { force: true, recursive: true });
}

function copyClassifiedFromWorktree({
  repoRoot,
  dest,
  classified,
}: {
  repoRoot: string;
  dest: string;
  classified: { path: string; kind: string }[];
}) {
  for (const { path, kind } of classified) {
    if (kind === "exclude") {
      continue;
    }
    const from = join(repoRoot, path);
    if (!existsSync(from)) {
      continue;
    }
    const to = join(dest, path);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
  }
}
