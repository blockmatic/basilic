import { config } from '@repo/eslint-config/base'

export default [
  ...config,
  // Allow process.env in core error handling code (infrastructure)
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
]
