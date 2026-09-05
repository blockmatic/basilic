import { spawnSync } from 'node:child_process'

export function listTrackedFiles({ repoRoot }: { repoRoot: string }) {
  return gitZeroFiles({ repoRoot, args: ['ls-files', '-z'] })
}

export function listUntrackedFiles({ repoRoot }: { repoRoot: string }) {
  return gitZeroFiles({ repoRoot, args: ['ls-files', '--others', '--exclude-standard', '-z'] })
}

function gitZeroFiles({ repoRoot, args }: { repoRoot: string; args: string[] }) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024,
  })
  if (result.status !== 0)
    throw new Error(result.stderr.toString('utf8') || `git ${args[0]} failed`)
  return result.stdout.toString('utf8').split('\0').filter(Boolean)
}

export function gitHeadSha({ repoRoot }: { repoRoot: string }) {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) throw new Error(result.stderr || 'git rev-parse failed')
  return result.stdout.trim()
}

export function assertCleanWorktree({ repoRoot }: { repoRoot: string }) {
  const result = spawnSync('git', ['status', '--porcelain'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) throw new Error(result.stderr || 'git status failed')
  if (result.stdout.trim())
    throw new Error('Refusing to assemble from a dirty worktree. Commit or stash first.')
}

export function extractHeadArchive({ repoRoot, dest }: { repoRoot: string; dest: string }) {
  const archive = spawnSync('git', ['archive', '--format=tar', 'HEAD'], {
    cwd: repoRoot,
    maxBuffer: 200 * 1024 * 1024,
  })
  if (archive.status !== 0) throw new Error(archive.stderr.toString('utf8') || 'git archive failed')
  const extract = spawnSync('tar', ['-xf', '-', '-C', dest], {
    input: archive.stdout,
    maxBuffer: 200 * 1024 * 1024,
  })
  if (extract.status !== 0) throw new Error(extract.stderr.toString('utf8') || 'tar extract failed')
}
