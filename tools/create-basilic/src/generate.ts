import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { assertEmptyDest, copyTree, IoError, moveAtomic } from './copy.js'
import { bundledTemplateRoot } from './paths.js'
import { assertNode24, type ProjectName, parseProjectName } from './project-name.js'
import { applyProjectTransforms } from './transforms/index.js'

export type GenerateInput = {
  directory: string
  yes?: boolean
  templateRoot?: string
  generatorVersion: string
}

export async function generateProject({
  directory,
  yes = false,
  templateRoot = bundledTemplateRoot,
  generatorVersion,
}: GenerateInput) {
  assertNode24()
  const name = parseProjectName({ directory })
  if (!existsSync(join(templateRoot, 'package.json')))
    throw new IoError(
      'Bundled template is missing. Assemble before packing, or pass templateRoot in tests.',
    )
  const dest = resolve(directory)
  await assertEmptyDest({ dest })
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })

  const parent = dirname(dest)
  const tempParent = parent === dest ? tmpdir() : parent
  const temp = await mkdtemp(join(tempParent, `.create-basilic-${name.slug}-`))

  try {
    await copyTree({ from: templateRoot, to: temp })
    applyProjectTransforms({ destRoot: temp, name })
    writeAdopterReadme({ destRoot: temp, name })
    writeProvenance({ destRoot: temp, name, generatorVersion, yes })
    rmSync(join(temp, '.basilic-template.json'), { force: true })
    await moveAtomic({ from: temp, to: dest })
  } catch (error) {
    rmSync(temp, { recursive: true, force: true })
    if (error instanceof IoError) throw error
    throw new IoError(error instanceof Error ? error.message : String(error))
  }

  return { dest, name }
}

function writeProvenance({
  destRoot,
  name,
  generatorVersion,
  yes,
}: {
  destRoot: string
  name: ProjectName
  generatorVersion: string
  yes: boolean
}) {
  const path = join(destRoot, 'package.json')
  const pkg = JSON.parse(readFileSync(path, 'utf8')) as {
    basilic?: unknown
  }
  let templateSourceSha = 'unknown'
  let templateDigest = 'unknown'
  try {
    const meta = JSON.parse(readFileSync(join(destRoot, '.basilic-template.json'), 'utf8')) as {
      sourceSha: string
      digest: string
    }
    templateSourceSha = meta.sourceSha
    templateDigest = meta.digest
  } catch {
    // packed templates always include the meta file; tests may omit it
  }
  pkg.basilic = {
    generatorVersion,
    templateSourceSha,
    templateDigest,
    inputs: { directory: name.slug, yes },
  }
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
}

function writeAdopterReadme({ destRoot, name }: { destRoot: string; name: ProjectName }) {
  writeFileSync(join(destRoot, 'README.md'), adopterReadme({ name }))
}

function adopterReadme({ name }: { name: ProjectName }) {
  return `# ${name.displayName}

Generated with [create-basilic](https://www.npmjs.com/package/create-basilic). This tree is an independent monorepo (API, web, mobile). It does not include Basilic's documentation app or generator.

## Setup

Requires Node.js 24.x and pnpm 11.24.0.

\`\`\`bash
pnpm setup
pnpm --filter @repo/api db:start
pnpm reset
pnpm dev
\`\`\`

- API: http://localhost:3001
- Web: http://localhost:3000 — first login \`test@test.ai\` (\`ALLOW_TEST=true\` in copied env)
- Mobile: \`pnpm --filter @repo/mobile start\`

Local starter docs: [\`docs/basilic/\`](docs/basilic/). Hosted: [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready). After you own the copy: [After fork](https://basilic-docs.vercel.app/docs/development/after-fork).

## Customize

Replace display names, mobile scheme (\`apps/mobile/app.json\`), DeepSec \`githubUrl\`, and Vercel project slugs in \`apps/web/next.config.mjs\`. Keep \`@repo/*\` package names. Fill \`_first/PRODUCT.md\`.

Upstream contributions belong in a Basilic fork, not this generated repo.
`
}
