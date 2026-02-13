/** @type {import('next').NextConfig} */

// Must match basilic-fastify Vercel deployment URL pattern:
// - Production: basilic-fastify.vercel.app (or basilic-fastify-gaboesquivel.vercel.app)
// - Preview (commit): basilic-fastify-{hash}-gaboesquivel.vercel.app
// - Preview (branch): basilic-fastify-git-{branch}-gaboesquivel.vercel.app
const API_PROJECT_NAME = 'basilic-fastify'
const TEAM_SLUG = 'gaboesquivel'

function toBranchSlug(ref) {
  return ref
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
}

function getApiUrl() {
  const vercelEnv = process.env.VERCEL_ENV
  const branch = process.env.VERCEL_GIT_COMMIT_REF
  if (!vercelEnv || !branch) return undefined
  const url =
    vercelEnv === 'production' || branch === 'main' || branch === 'develop'
      ? process.env.NEXT_PUBLIC_API_URL
      : `https://${API_PROJECT_NAME}-git-${toBranchSlug(branch)}-${TEAM_SLUG}.vercel.app`
  if (process.env.VERCEL) {
    // biome-ignore lint/suspicious/noConsole: build-time debug for Vercel build logs
    console.log('[next.config] NEXT_PUBLIC_API_URL:', url)
  }
  return url
}

const apiUrl = process.env.VERCEL ? getApiUrl() : undefined

const nextConfig = {
  ...(apiUrl !== undefined && {
    env: { NEXT_PUBLIC_API_URL: apiUrl },
  }),
  transpilePackages: [
    '@repo/ui',
    '@repo/core',
    '@repo/react',
    '@repo/sentry',
    '@repo/utils',
    'ai',
    'eventsource-parser',
  ],
  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],
  // @/ alias is automatically resolved from tsconfig.json paths
  // Webpack config forces Next.js to use webpack instead of Turbopack
  webpack: config => {
    // Resolve "source" condition from internal packages for direct TS imports (after defaults so node_modules use dist)
    config.resolve.conditionNames = [...(config.resolve.conditionNames ?? []), 'source']
    // Resolve .js imports to .ts files for transpiled packages
    // Merge with existing extensionAlias if present to preserve Next.js defaults
    const existingExtensionAlias = config.resolve.extensionAlias || {}
    config.resolve.extensionAlias = {
      ...existingExtensionAlias,
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.jsx': ['.tsx', '.jsx'],
    }
    return config
  },
}

export default nextConfig
