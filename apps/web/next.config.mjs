/** @type {import('next').NextConfig} */

import { withSentryConfig } from '@sentry/nextjs'

// Must match basilic-fastify Vercel deployment URL pattern. Fork/deploy: change API_PROJECT_NAME
// and TEAM_SLUG to your Fastify project and Vercel team slug.
// - Production: basilic-fastify.vercel.app (or basilic-fastify-gaboesquivel.vercel.app)
// - Preview (commit): basilic-fastify-{hash}-gaboesquivel.vercel.app
// - Preview (branch): basilic-fastify-git-{branch}-gaboesquivel.vercel.app
const apiProjectName = 'basilic-fastify'
const teamSlug = 'gaboesquivel'

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

  if (!vercelEnv || !branch) {
    const missing = []
    if (!vercelEnv) missing.push('VERCEL_ENV')
    if (!branch) missing.push('VERCEL_GIT_COMMIT_REF')
    // biome-ignore lint/suspicious/noConsole: build-time warning for URL resolution
    console.warn(
      `[next.config] getApiUrl: cannot resolve API URL: ${missing.join(' and ')} must be set (vercelEnv=${vercelEnv ?? 'undefined'}, branch=${branch ?? 'undefined'})`,
    )
    return undefined
  }

  const isProductionBranch = vercelEnv === 'production' || branch === 'main' || branch === 'develop'
  const url = isProductionBranch
    ? process.env.NEXT_PUBLIC_API_URL
    : `https://${apiProjectName}-git-${toBranchSlug(branch)}-${teamSlug}.vercel.app`

  if (isProductionBranch && !url) {
    const msg = `[next.config] getApiUrl: NEXT_PUBLIC_API_URL must be configured for production/main/develop deployments (vercelEnv=${vercelEnv}, branch=${branch})`
    // biome-ignore lint/suspicious/noConsole: build-time error
    console.error(msg)
    throw new Error(msg)
  }

  if (process.env.VERCEL)
    // biome-ignore lint/suspicious/noConsole: build-time debug for Vercel build logs
    console.log('[next.config] NEXT_PUBLIC_API_URL:', url)

  return url
}

const apiUrl = process.env.VERCEL ? getApiUrl() : undefined

const nextConfig = {
  // Next 16.3 defaults to the TypeScript CLI (`typescript/bin/tsc`). The dual-package
  // alias (`typescript` → @typescript/typescript6) only ships `tsc6` + the compiler API.
  experimental: { useTypeScriptCli: false },
  ...(apiUrl !== undefined && {
    env: { NEXT_PUBLIC_API_URL: apiUrl },
  }),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com', pathname: '/coins/**' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com', pathname: '/coins/**' },
    ],
  },
  async redirects() {
    return [{ source: '/dashboard', destination: '/', permanent: true }]
  },
  transpilePackages: [
    '@repo/ui',
    '@repo/core',
    '@repo/react',
    '@repo/error',
    '@repo/utils',
    'ai',
    'eventsource-parser',
    // ESM-only unist/mdast deps for react-markdown - webpack needs to transpile for proper named-export resolution
    'mdast-util-from-markdown',
    'unist-util-is',
    'unist-util-stringify-position',
    'unist-util-visit-parents',
  ],
  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],
  // @/ alias is automatically resolved from tsconfig.json paths
  // Webpack config forces Next.js to use webpack instead of Turbopack
  webpack: config => {
    // Resolve "source" condition from internal packages for direct TS imports (after defaults so node_modules use dist)
    config.resolve.conditionNames = [...(config.resolve.conditionNames ?? []), 'source']
    // Stub optional wagmi connectors we don't use to avoid build resolution errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      porto: false,
      'porto/internal': false,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      '@walletconnect/ethereum-provider': false,
    }
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? 'placeholder',
  project: process.env.SENTRY_PROJECT ?? 'placeholder',
  silent: !process.env.CI,
})
