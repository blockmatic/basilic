import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['dist/**', 'template/**'],
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-properties': 'off',
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
]
