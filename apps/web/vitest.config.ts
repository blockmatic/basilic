import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/auth/request-id.test.ts'],
    environment: 'node',
  },
})
