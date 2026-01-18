import js from '@eslint/js'
import onlyWarn from 'eslint-plugin-only-warn'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

/**
 * Base ESLint configuration - Correctness-only rules.
 *
 * This config follows a hybrid Biome + ESLint architecture:
 * - Biome handles: formatting, import sorting, unused vars, style rules
 * - ESLint handles: TypeScript correctness, React/Hooks rules, Next.js rules, import boundaries
 *
 * All formatting rules are disabled here (Biome owns formatting).
 * This config focuses on correctness and architectural enforcement only.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      // Formatting rules - disabled (Biome handles)
      semi: 'off',
      quotes: 'off',
      '@typescript-eslint/quotes': 'off',
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/brace-style': 'off',
      'arrow-body-style': 'off',
      'arrow-parens': 'off',
      '@typescript-eslint/arrow-parens': 'off',
      'no-multi-spaces': 'off',
      '@typescript-eslint/no-multi-spaces': 'off',
      'no-trailing-spaces': 'off',
      '@typescript-eslint/no-trailing-spaces': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/order': 'off',
      'import/newline-after-import': 'off',
      'import/no-duplicate-imports': 'off',
      'object-curly-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'comma-spacing': 'off',
      '@typescript-eslint/comma-spacing': 'off',
      'key-spacing': 'off',
      'space-before-blocks': 'off',
      'space-before-function-paren': 'off',
      'space-in-parens': 'off',
      'space-infix-ops': 'off',
      '@typescript-eslint/space-infix-ops': 'off',
      'space-unary-ops': 'off',
      'spaced-comment': 'off',

      // Logic rules - PRESERVE (DO NOT TOUCH)
      'turbo/no-undeclared-env-vars': 'warn',
      // Allow single-line if statements without brackets
      curly: 'off',
      // Prefer interfaces over types for object definitions
      '@typescript-eslint/consistent-type-definitions': 'off',
      // File size limit - helps agents maintain manageable file sizes
      'max-lines': ['error', { max: 300 }],
      // Disable unsafe rules - we use Zod-first validation strategy instead
      // This aligns with ts-reset (JSON.parse/response.json return unknown) which requires runtime validation
      // See config/eslint/README.md for details and .cursor/rules/base/typescript.mdc for ts-reset documentation
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  // Disable max-lines rule for test files - they legitimately need more lines for setup, mocks, and comprehensive coverage
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.e2e-spec.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
]
