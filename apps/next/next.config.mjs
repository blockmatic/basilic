/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/core', '@repo/react', '@repo/error', '@repo/utils'],
  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],
  // @/ alias is automatically resolved from tsconfig.json paths
  // Webpack config forces Next.js to use webpack instead of Turbopack
  webpack: config => {
    // Resolve "source" condition from internal packages for direct TS imports
    config.resolve.conditionNames = ['source', ...(config.resolve.conditionNames ?? ['...'])]
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
