import { config } from '@repo/eslint-config/base'

export default [
  ...config,
  {
    files: ['src/routes/auth/oauth/twitter/exchange.ts'],
    rules: {
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/routes/reference/template.ts'],
    rules: {
      'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-params': 'off',
    },
  },
]
