import { config } from '@repo/eslint-config/react-internal'

export default [
  ...config,
  {
    ignores: ['.react-email/**'],
  },
  // Email templates need default exports for React Email framework
  {
    files: ['emails/**/*.tsx'],
    rules: {
      'import/no-default-export': 'off',
      'max-lines': 'off', // Email templates are often long
    },
  },
]
