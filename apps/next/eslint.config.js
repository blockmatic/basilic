import { nextJsConfig } from '@repo/eslint-config/next-js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    files: ['app/(dashboard)/settings/(profile)/profile-section.tsx'],
    rules: { 'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }] },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
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
]
