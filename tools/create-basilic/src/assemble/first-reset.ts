import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function resetFirstInstance({ destRoot }: { destRoot: string }) {
  rmSync(join(destRoot, '_first/basilic'), { recursive: true, force: true })
  mkdirSync(join(destRoot, '_first'), { recursive: true })
  writeFileSync(join(destRoot, '_first/FIRST.md'), firstMap)
  writeFileSync(join(destRoot, '_first/PRODUCT.md'), productShell)
}

const firstMap = `# FIRST

spec: 0.3-draft

This repository’s instance map. Absent files beat empty stubs. Do not copy another product’s overlay in.

Durable product facts live in [PRODUCT.md](PRODUCT.md). Fill stations as you make durable decisions. The factory lives in [\`blockmatic/first\`](https://github.com/blockmatic/first). Technical starter docs: [\`docs/basilic/\`](../docs/basilic/). Hosted: [basilic-docs](https://basilic-docs.vercel.app/docs).

## In

- product: [PRODUCT.md](PRODUCT.md)

## Out

journeys, architecture, data, api, documentation, workflow, quality, security, operations — add files here when those stations are In.
`

const productShell = `# Product First

## Principle

See /f-product.

## Artifacts

- **Unresolved:** Fill this overlay for the generated product. Do not inherit Basilic’s roadmap.

## Minimum Useful Artifact

- problem: (unresolved)
- users: (unresolved)
- goal: (unresolved)
- non-goals: (unresolved)
- audience/channel/first use: \`pnpm setup\` → \`pnpm --filter @repo/api db:start\` → \`pnpm reset\` → \`pnpm dev\`
- metrics: (unresolved)
- events: (unresolved)
- owners: (unresolved)

## Notes

Product names what, why, and how we will know. Do not write product intent into \`docs/basilic/\`.
`
