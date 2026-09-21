import { nextJsConfig } from '@repo/eslint-config/next-js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/utils',
              message:
                'Use subpath imports: @repo/utils/logger/server, @repo/utils/logger/client, @repo/utils/async, @repo/utils/web3, etc.',
            },
            {
              name: '@repo/ui',
              message:
                'Use subpath imports: @repo/ui/components/*, @repo/ui/lib/utils, @repo/ui/base, etc.',
            },
            {
              name: '@repo/db',
              message: 'Next.js must not import @repo/db. Call Fastify via @repo/core.',
            },
            {
              name: '@repo/markets',
              message: 'Next.js must not import @repo/markets. Call Fastify via @repo/core.',
            },
            {
              name: '@repo/onchain',
              message: 'Next.js must not import @repo/onchain. Call Fastify via @repo/core.',
            },
            {
              name: 'drizzle-orm',
              message: 'Next.js must not import drizzle-orm. Database access stays in @repo/db.',
            },
          ],
          patterns: [
            {
              group: ['@radix-ui/react-*'],
              message:
                'Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.',
            },
            {
              group: ['@base-ui/react', '@base-ui/react/*'],
              message:
                'Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.',
            },
            {
              group: ['@repo/db/*', 'drizzle-orm/*'],
              message: 'Next.js must not import @repo/db or drizzle-orm.',
            },
          ],
        },
      ],
    },
  },
  // profile-section: form + change-email + linked-accounts in one file; 350-line exemption
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
