import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const configDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(configDir),
    },
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
})
