import { config } from '@repo/eslint-config/base'

export default [
  ...config,
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/db',
              message: 'Eve hello must not import @repo/db. Named db fns land in E2.',
            },
            {
              name: '@repo/db/schema',
              message: 'Eve must not import @repo/db/schema. Use named functions in E2.',
            },
            {
              name: 'drizzle-orm',
              message: 'Eve must not import drizzle-orm. Database access stays in @repo/db.',
            },
            {
              name: '@repo/markets',
              message: '@repo/markets is not in this hello workspace. Extract in E2.',
            },
            {
              name: '@repo/onchain',
              message: '@repo/onchain is not this step.',
            },
            {
              name: 'fastify',
              message: 'Eve is a sibling process. Do not import Fastify.',
            },
          ],
          patterns: [
            {
              group: ['@repo/db/*', 'drizzle-orm/*', 'fastify/*', '@repo/api', '@repo/api/*'],
              message: 'Eve hello stays off Fastify, @repo/db, and drizzle-orm.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.eve/**',
      '.output/**',
      '.nitro/**',
      '.vercel/**',
      '.turbo/**',
      'dist/**',
    ],
  },
]
