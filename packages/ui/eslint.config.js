import { config } from '@repo/eslint-config/react-internal'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  // Allow direct Radix imports in UI package (this is where we centralize Radix imports)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
]
