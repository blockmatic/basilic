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
              message: '@repo/onchain must not import @repo/db.',
            },
            {
              name: '@repo/markets',
              message: '@repo/onchain must not import @repo/markets.',
            },
            {
              name: 'fastify',
              message: '@repo/onchain must not import Fastify.',
            },
            {
              name: 'drizzle-orm',
              message: '@repo/onchain must not import drizzle-orm.',
            },
          ],
          patterns: [
            {
              group: [
                '@repo/db/*',
                '@repo/markets/*',
                'fastify/*',
                'drizzle-orm/*',
                '@repo/api',
                '@repo/api/*',
              ],
              message: '@repo/onchain stays off Fastify, @repo/db, @repo/markets, and drizzle-orm.',
            },
          ],
        },
      ],
    },
  },
]
