import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts', 'agents/**/*.test.ts'],
    globals: true,
    environment: 'node',
    fileParallelism: false,
    maxWorkers: 1,
    setupFiles: ['./vitest.setup.ts'],
  },
})
