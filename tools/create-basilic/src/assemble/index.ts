import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { digestTree } from '../digest.js'
import {
  assertCleanWorktree,
  extractHeadArchive,
  gitHeadSha,
  listTrackedFiles,
  listUntrackedFiles,
} from '../git.js'
import { classifyTrackedFiles, loadManifest } from './classify.js'
import { resetFirstInstance } from './first-reset.js'
import { regenerateLockfile } from './lockfile.js'
import { rewritePointers } from './pointers.js'
import { snapshotDocs } from './snapshot-docs.js'
import { applyAssembleTransforms } from './transforms.js'

export const forbiddenGeneratedPaths = [
  'apps/docu',
  'tools/create-basilic',
  'scripts/prepare-publish.mjs',
  'scripts/restore-publish.mjs',
  '_first/basilic',
  'release-please-config.json',
  '.release-please-manifest.json',
  '.github/workflows/release-please.yml',
  '.github/workflows/publish-create-basilic.yml',
]

export const agentReadPaths = [
  'AGENTS.md',
  '.cursor/rules/base/general.mdc',
  '.cursor/rules/base/file-organization.mdc',
  '.cursor/rules/base/naming.mdc',
  '.cursor/rules/base/docs.mdc',
  '.agents/skills/b/SKILL.md',
  '.agents/skills/b/b-exec-push/SKILL.md',
  '.agents/skills/b/b-git-commit/SKILL.md',
  '_first/FIRST.md',
  '_first/PRODUCT.md',
  'docs/basilic/development/index.md',
  'docs/basilic/development/file-organization.md',
  'docs/basilic/testing/product-ready.md',
]

export function assembleTemplate({
  repoRoot,
  dest,
  lockfile = false,
  allowDirty = false,
}: {
  repoRoot: string
  dest: string
  lockfile?: boolean
  allowDirty?: boolean
}) {
  if (!allowDirty) assertCleanWorktree({ repoRoot })

  const manifest = loadManifest()
  const tracked = listTrackedFiles({ repoRoot })
  const files = allowDirty
    ? [...new Set([...tracked, ...listUntrackedFiles({ repoRoot })])]
    : tracked
  const { classified, unclassified } = classifyTrackedFiles({ files, manifest })
  if (unclassified.length > 0) {
    const preview = unclassified.slice(0, 20).join('\n')
    throw new Error(
      `Unclassified tracked paths (${unclassified.length}). Add include/transform/exclude rules.\n${preview}`,
    )
  }

  mkdirSync(dest, { recursive: true })

  if (allowDirty) {
    copyClassifiedFromWorktree({ repoRoot, dest, classified })
  } else {
    extractHeadArchive({ repoRoot, dest })
    snapshotDocs({ sourceRoot: dest, destRoot: dest })
    for (const { path, kind } of classified) {
      if (kind !== 'exclude') continue
      rmSync(join(dest, path), { recursive: true, force: true })
    }
  }

  if (allowDirty) snapshotDocs({ sourceRoot: repoRoot, destRoot: dest })

  applyAssembleTransforms({ destRoot: dest })
  resetFirstInstance({ destRoot: dest })
  rewritePointers({ destRoot: dest })
  if (lockfile) regenerateLockfileOutsideWorkspace({ dest, repoRoot })

  const digest = digestTree({ root: dest })
  const sourceSha = gitHeadSha({ repoRoot })
  writeFileSync(
    join(dest, '.basilic-template.json'),
    `${JSON.stringify(
      {
        sourceSha,
        digest,
        files: classified.filter(row => row.kind !== 'exclude').length,
      },
      null,
      2,
    )}\n`,
  )

  return { digest, sourceSha, classified, unclassified }
}

function regenerateLockfileOutsideWorkspace({
  dest,
  repoRoot,
}: {
  dest: string
  repoRoot: string
}) {
  const destResolved = resolve(dest)
  const repoResolved = resolve(repoRoot)
  const nested = destResolved === repoResolved || destResolved.startsWith(`${repoResolved}${sep}`)
  if (!nested) {
    regenerateLockfile({ destRoot: dest })
    return
  }
  const staging = join(tmpdir(), `create-basilic-lock-${process.pid}`)
  rmSync(staging, { recursive: true, force: true })
  cpSync(dest, staging, { recursive: true })
  regenerateLockfile({ destRoot: staging })
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(staging, dest, { recursive: true })
  rmSync(staging, { recursive: true, force: true })
}

function copyClassifiedFromWorktree({
  repoRoot,
  dest,
  classified,
}: {
  repoRoot: string
  dest: string
  classified: { path: string; kind: string }[]
}) {
  for (const { path, kind } of classified) {
    if (kind === 'exclude') continue
    const from = join(repoRoot, path)
    if (!existsSync(from)) continue
    const to = join(dest, path)
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to)
  }
}
