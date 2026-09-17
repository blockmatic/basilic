import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/auth/request-id.test.ts', 'lib/analytics.types.test.ts'],
    environment: 'node',
  },
})
