import { config } from '@repo/eslint-config/base'

export default [
  ...config,
  {
    files: [
      'src/routes/auth/oauth/twitter/exchange.ts',
      'src/routes/auth/oauth/github/exchange.ts',
      'src/routes/auth/oauth/facebook/exchange.ts',
      'src/routes/auth/oauth/google/exchange.ts',
    ],
    rules: { complexity: 'off' },
  },
]
