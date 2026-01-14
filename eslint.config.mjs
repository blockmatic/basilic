import { config } from '@repo/eslint-config/library.js'

/**
 * Root ESLint configuration - Correctness-only rules.
 *
 * This config applies only to the repository root (package.json, config files).
 * Workspace packages and apps have their own eslint.config.* files.
 *
 * Biome handles formatting and stylistic linting.
 * ESLint focuses on correctness: TypeScript and architecture rules.
 */
export default [
  ...config,
  {
    ignores: ['apps/**', 'packages/**', 'devtools/**', 'node_modules/**'],
  },
]
