import { nextJsConfig } from '@repo/eslint-config/next-js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
]
