import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@repo/utils/error': resolve(__dirname, '../../packages/utils/src/error/index.ts'),
      '@repo/utils': resolve(__dirname, '../../packages/utils/src'),
    },
  },
  server: {
    deps: {
      inline: [/@repo\/utils/],
    },
  },
})
