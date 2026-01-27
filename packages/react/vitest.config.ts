import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@repo/core': resolve(__dirname, '../core/src/index.ts'),
      '@repo/ui': resolve(__dirname, '../ui/src'),
      '@repo/utils': resolve(__dirname, '../utils/src'),
    },
  },
})
