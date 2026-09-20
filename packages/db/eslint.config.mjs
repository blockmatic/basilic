import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['dist/**', 'src/migrations/**'],
  },
  {
    files: ['drizzle.config.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
]
