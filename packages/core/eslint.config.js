import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['**/gen/**', '**/*.gen.ts', '**/*.gen.js'],
  },
]
