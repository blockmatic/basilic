import { config } from '@repo/eslint-config/base'

export default [
  ...config,
  {
    files: [
      'src/routes/auth/oauth/twitter/exchange.ts',
      'src/routes/auth/oauth/github/exchange.ts',
      'src/routes/auth/oauth/facebook/exchange.ts',
    ],
    rules: { complexity: 'off' },
  },
  {
    files: ['src/routes/reference/template.ts'],
    rules: {
      'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-params': 'off',
    },
  },
]
