import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const configDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@repo/utils': resolve(configDir, '../utils/src'),
    },
  },
  server: {
    deps: {
      inline: [/@repo\/utils/],
    },
  },
})
