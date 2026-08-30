import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  // Next 16.3 defaults to the TypeScript CLI (`typescript/bin/tsc`). The dual-package
  // alias (`typescript` → @typescript/typescript6) only ships `tsc6` + the compiler API.
  experimental: { useTypeScriptCli: false },
}

export default withMDX(config)
