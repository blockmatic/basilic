import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  // Next 16.3 defaults to the TypeScript CLI (`typescript/bin/tsc`). The dual-package
  // alias (`typescript` → @typescript/typescript6) only ships `tsc6` + the compiler API.
  experimental: { useTypeScriptCli: false },
  async redirects() {
    return [
      {
        source: '/docs/ai-workflow',
        destination: '/docs/development/ai-workflow',
        permanent: true,
      },
      {
        source: '/docs/cursor-workflow',
        destination: '/docs/development/ai-workflow',
        permanent: true,
      },
      {
        source: '/docs/cursor-workflow/:path*',
        destination: '/docs/development/ai-workflow',
        permanent: true,
      },
      { source: '/docs/security', destination: '/docs/architecture/security', permanent: true },
      {
        source: '/docs/architecture/package-conventions',
        destination: '/docs/development/package-conventions',
        permanent: true,
      },
      {
        source: '/docs/architecture/frontend-stack',
        destination: '/docs/architecture/frontend',
        permanent: true,
      },
      {
        source: '/docs/testing/frontend-testing',
        destination: '/docs/testing/e2e-testing',
        permanent: true,
      },
      { source: '/docs/api-development', destination: '/docs/architecture/api', permanent: true },
      {
        source: '/docs/architecture/dev-tooling',
        destination: '/docs/development/dev-tooling',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
