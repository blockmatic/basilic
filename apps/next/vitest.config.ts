import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@repo/ui': resolve(__dirname, '../../packages/ui/src'),
      '@repo/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      'lucide-react': resolve(__dirname, './vitest.setup.lucide.ts'),
    },
  },
})
