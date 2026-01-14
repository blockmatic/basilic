import { config } from '@basilic/eslint-config/react-internal'

export default [
  ...config,
  {
    ignores: ['**/gen/**', '**/*.gen.ts', '**/*.gen.js'],
  },
]
