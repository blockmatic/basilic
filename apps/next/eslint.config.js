import { nextJsConfig } from '@repo/eslint-config/next-js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      '.cache-synpress/**',
      '.turbo/**',
      '.vercel/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'playwright/.cache/**',
      'playwright/.auth/**',
    ],
  },
  {
    files: ['e2e/wallet-setup/*.ts'],
    rules: { 'import/no-default-export': 'off' },
  },
]
