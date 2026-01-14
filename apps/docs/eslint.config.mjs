import { nextJsConfig } from '@repo/eslint-config/next-js'

const eslintConfig = [
  ...nextJsConfig,
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', '.source/**', 'next-env.d.ts'],
  },
]

export default eslintConfig
