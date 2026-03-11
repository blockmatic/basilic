import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['**/gen/**', '**/*.gen.ts', '**/*.gen.js'],
  },
  {
    files: ['src/config.ts'],
    rules: {
      'no-restricted-properties': 'off',
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
]
