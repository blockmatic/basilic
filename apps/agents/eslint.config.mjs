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
              name: '@repo/db/schema',
              message: 'Eve must not import @repo/db/schema. Use named functions.',
            },
            {
              name: 'drizzle-orm',
              message: 'Eve must not import drizzle-orm. Database access stays in @repo/db.',
            },
            {
              name: 'fastify',
              message: 'Eve is a sibling process. Do not import Fastify.',
            },
          ],
          patterns: [
            {
              group: ['@repo/db/*', 'drizzle-orm/*', 'fastify/*', '@repo/api', '@repo/api/*'],
              message: 'Eve stays off Fastify, @repo/db/schema, and drizzle-orm.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
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
