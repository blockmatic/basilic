import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const configDir = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const reactPackageRoot = realpathSync(dirname(require.resolve('react/package.json')))
const reactDomPackageRoot = realpathSync(dirname(require.resolve('react-dom/package.json')))
const reactDomClientEntry = realpathSync(require.resolve('react-dom/client'))

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    // pnpm: keep symlinked package paths so react-dom and @tanstack/react-query share one react instance
    preserveSymlinks: true,
    dedupe: ['react', 'react-dom'],
    alias: {
      '@repo/core': resolve(configDir, '../core/src/index.ts'),
      '@repo/ui': resolve(configDir, '../ui/src'),
      '@repo/utils': resolve(configDir, '../utils/src'),
      react: reactPackageRoot,
      'react-dom': reactDomPackageRoot,
      'react-dom/client': reactDomClientEntry,
    },
  },
})
