import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const productShell = `# Product

Fill this brief for the generated product. Do not inherit Basilic's roadmap.

## Problem

(unresolved)

## Users

(unresolved)

## Goal

(unresolved)

## Non-goals

(unresolved)

## First use

\`pnpm setup\` → \`pnpm --filter @repo/api db:start\` → \`pnpm reset\` → \`pnpm dev\`

## Metrics

(unresolved)

## Events

(unresolved)

## Owners

(unresolved)

Do not write product intent into \`docs/basilic/\`.
`

export function resetProductBrief({ destRoot }: { destRoot: string }) {
  rmSync(join(destRoot, '_first'), { recursive: true, force: true })
  rmSync(join(destRoot, '.agents/skills/f'), { recursive: true, force: true })
  writeFileSync(join(destRoot, 'PRODUCT.md'), productShell)
}
