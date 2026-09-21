import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['dist/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/db',
              message: '@repo/markets must not import @repo/db.',
            },
            {
              name: 'fastify',
              message: '@repo/markets must not import Fastify.',
            },
            {
              name: 'drizzle-orm',
              message: '@repo/markets must not import drizzle-orm.',
            },
          ],
          patterns: [
            {
              group: ['@repo/db/*', 'fastify/*', 'drizzle-orm/*', '@repo/api', '@repo/api/*'],
              message: '@repo/markets stays off Fastify, @repo/db, and drizzle-orm.',
            },
          ],
        },
      ],
    },
  },
]
