import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const configDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@repo/core': resolve(configDir, '../core/src/index.ts'),
      '@repo/ui': resolve(configDir, '../ui/src'),
      '@repo/utils': resolve(configDir, '../utils/src'),
    },
  },
})
