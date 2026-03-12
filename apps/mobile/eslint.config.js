import { config as expoConfig } from '@repo/eslint-config/expo'

/** @type {import("eslint").Linter.Config} */
export default [
  ...expoConfig,
  {
    ignores: ['.expo/**', 'node_modules/**', 'dist/**', 'build/**', '.turbo/**', 'coverage/**'],
  },
]
