import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ProjectName } from '../project-name.js'

export function applyProjectTransforms({
  destRoot,
  name,
}: {
  destRoot: string
  name: ProjectName
}) {
  const replacements = projectReplacements({ name })
  for (const { path, from, to } of replacements) {
    const abs = join(destRoot, path)
    if (!existsSync(abs)) continue
    const source = readFileSync(abs, 'utf8')
    if (!source.includes(from)) continue
    writeFileSync(abs, source.replaceAll(from, to))
  }

  rewriteRootPackage({ destRoot, name })
  rewriteMobileScheme({ destRoot, name })
  rewriteNextConfig({ destRoot, name })
  rewriteWebEnvUrls({ destRoot })
}

function projectReplacements({ name }: { name: ProjectName }) {
  return [
    {
      path: 'apps/web/app/auth/login/login-form.tsx',
      from: 'Welcome to Basilic',
      to: `Welcome to ${name.displayName}`,
    },
    {
      path: 'apps/web/e2e/public.spec.ts',
      from: 'Welcome to Basilic',
      to: `Welcome to ${name.displayName}`,
    },
    {
      path: 'apps/web/app/layout.tsx',
      from: "default: 'Basilic'",
      to: `default: '${name.displayName}'`,
    },
    { path: 'apps/web/app/layout.tsx', from: "'%s | Basilic'", to: `'%s | ${name.displayName}'` },
    {
      path: 'apps/web/app/layout.tsx',
      from: 'Basilic web dashboard',
      to: `${name.displayName} web dashboard`,
    },
    {
      path: 'apps/web/app/(dashboard)/sidebar.tsx',
      from: '            Basilic\n',
      to: `            ${name.displayName}\n`,
    },
    {
      path: 'apps/web/app/auth/login/page.tsx',
      from: '              Basilic\n',
      to: `              ${name.displayName}\n`,
    },
    {
      path: 'apps/web/app/auth/callback/magiclink/route.ts',
      from: 'Enter code - Basilic',
      to: `Enter code - ${name.displayName}`,
    },
    { path: 'apps/web/app/terms/page.tsx', from: 'using Basilic', to: `using ${name.displayName}` },
    {
      path: 'apps/api/src/plugins/openapi.ts',
      from: "title: 'Basilic API'",
      to: `title: '${name.displayName} API'`,
    },
    {
      path: 'apps/api/src/plugins/openapi.ts',
      from: 'Basilic API documentation',
      to: `${name.displayName} API documentation`,
    },
    {
      path: 'apps/api/scripts/generate-openapi.ts',
      from: "title: 'Basilic API'",
      to: `title: '${name.displayName} API'`,
    },
    {
      path: 'apps/api/scripts/generate-openapi.ts',
      from: 'Basilic API documentation',
      to: `${name.displayName} API documentation`,
    },
    {
      path: 'apps/api/src/routes/root.ts',
      from: 'Basilic Fastify API',
      to: `${name.displayName} Fastify API`,
    },
    {
      path: 'apps/api/src/routes/root.spec.ts',
      from: 'Basilic Fastify API',
      to: `${name.displayName} Fastify API`,
    },
    {
      path: 'apps/api/src/routes/reference/template.ts',
      from: 'API Reference - Basilic',
      to: `API Reference - ${name.displayName}`,
    },
    {
      path: 'packages/cli/src/cli.ts',
      from: 'CLI for Basilic API',
      to: `CLI for ${name.displayName} API`,
    },
    {
      path: 'packages/cli/package.json',
      from: 'Basilic Fastify API',
      to: `${name.displayName} Fastify API`,
    },
    {
      path: 'packages/cli/README.md',
      from: 'the Basilic Fastify API',
      to: `the ${name.displayName} Fastify API`,
    },
    { path: '.deepsec/deepsec.config.ts', from: 'id: "app"', to: `id: "${name.slug}"` },
    {
      path: '.deepsec/deepsec.config.ts',
      from: 'https://github.com/example/app/blob/main',
      to: `https://github.com/example/${name.slug}/blob/main`,
    },
  ]
}

function rewriteRootPackage({ destRoot, name }: { destRoot: string; name: ProjectName }) {
  const path = join(destRoot, 'package.json')
  const pkg = JSON.parse(readFileSync(path, 'utf8')) as {
    name: string
    basilic?: unknown
  }
  pkg.name = name.packageName
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
}

function rewriteMobileScheme({ destRoot, name }: { destRoot: string; name: ProjectName }) {
  const scheme = `com.example.${name.slug.replace(/\./g, '-')}`
  const appJsonPath = join(destRoot, 'apps/mobile/app.json')
  if (existsSync(appJsonPath)) {
    const source = readFileSync(appJsonPath, 'utf8').replaceAll('com.blockmatic.basilic', scheme)
    writeFileSync(appJsonPath, source)
  }
  const maestroPath = join(destRoot, 'apps/mobile/.maestro/flows/home.yml')
  if (existsSync(maestroPath)) {
    const source = readFileSync(maestroPath, 'utf8').replaceAll('com.blockmatic.basilic', scheme)
    writeFileSync(maestroPath, source)
  }
}

function rewriteNextConfig({ destRoot, name }: { destRoot: string; name: ProjectName }) {
  const path = join(destRoot, 'apps/web/next.config.mjs')
  if (!existsSync(path)) return
  const slug = name.slug.replace(/\./g, '-')
  const source = readFileSync(path, 'utf8')
    .replace("const apiProjectName = 'basilic-fastify'", `const apiProjectName = '${slug}-api'`)
    .replace("const teamSlug = 'gaboesquivel'", "const teamSlug = 'your-team'")
  writeFileSync(path, source)
}

function rewriteWebEnvUrls({ destRoot }: { destRoot: string }) {
  for (const file of ['apps/web/.env.production', 'apps/web/.env.staging']) {
    const path = join(destRoot, file)
    if (!existsSync(path)) continue
    const source = readFileSync(path, 'utf8').replaceAll(
      'https://basilic-fastify.vercel.app',
      'https://your-api.vercel.app',
    )
    writeFileSync(path, source)
  }
}
