import { readFileSync } from 'node:fs'
import { manifestPath } from '../paths.js'

export type Classification = 'include' | 'transform' | 'exclude'

export type Manifest = {
  exclude: string[]
  transform: string[]
  include: string[]
}

export type ClassifiedPath = {
  path: string
  kind: Classification
  rule: string
}

export function loadManifest({ path = manifestPath }: { path?: string } = {}) {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest
}

export function matchesRule({ path, rule }: { path: string; rule: string }) {
  const normalized = rule.endsWith('/') ? rule.slice(0, -1) : rule
  return path === normalized || path.startsWith(`${normalized}/`)
}

export function longestMatch({ path, rules }: { path: string; rules: string[] }) {
  let best: string | undefined
  for (const rule of rules) {
    if (!matchesRule({ path, rule })) continue
    if (!best || rule.length > best.length) best = rule
  }
  return best
}

const kindRank = { exclude: 0, transform: 1, include: 2 } as const

export function classifyPath({ path, manifest }: { path: string; manifest: Manifest }) {
  const candidates = (
    [
      { kind: 'exclude', rule: longestMatch({ path, rules: manifest.exclude }) },
      { kind: 'transform', rule: longestMatch({ path, rules: manifest.transform }) },
      { kind: 'include', rule: longestMatch({ path, rules: manifest.include }) },
    ] as const
  ).filter((row): row is { kind: Classification; rule: string } => Boolean(row.rule))

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    const byLength = b.rule.length - a.rule.length
    if (byLength !== 0) return byLength
    return kindRank[a.kind] - kindRank[b.kind]
  })

  const winner = candidates[0]
  if (!winner) return null
  return { kind: winner.kind, rule: winner.rule }
}

export function classifyTrackedFiles({ files, manifest }: { files: string[]; manifest: Manifest }) {
  const classified: ClassifiedPath[] = []
  const unclassified: string[] = []

  for (const path of files) {
    const result = classifyPath({ path, manifest })
    if (!result) {
      unclassified.push(path)
      continue
    }
    classified.push({ path, kind: result.kind, rule: result.rule })
  }

  return { classified, unclassified }
}
