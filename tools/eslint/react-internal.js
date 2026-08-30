import js from '@eslint/js'
import pluginCheckFile from 'eslint-plugin-check-file'
import pluginImport from 'eslint-plugin-import-x'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { config as baseConfig } from './base.js'

/**
 * ESLint configuration for React libraries - Correctness-only rules.
 *
 * This config extends the base config and adds:
 * - React and React Hooks rules
 * - Import boundary enforcement (no-default-export for components)
 *
 * Biome handles formatting and stylistic linting.
 * ESLint focuses on correctness: TypeScript, React, and architecture rules.
 *
 * @type {import("eslint").Linter.Config} */
// Restrict React plugin to JSX/TSX and pin the React version — eslint-plugin-react 7.x
// still calls context.getFilename() (removed in ESLint 10) when version is "detect"
const reactFiles = ['**/*.{jsx,tsx}']
const tsxFiles = ['**/*.{ts,tsx}']

export const config = [
  ...baseConfig,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: reactFiles,
    ...pluginReact.configs.flat.recommended,
  },
  {
    files: reactFiles,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    files: reactFiles,
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: '19.2' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/compiler': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-leaked-render': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'function-expression',
        },
      ],
    },
  },
  {
    files: tsxFiles,
    plugins: {
      'check-file': pluginCheckFile,
      import: pluginImport,
    },
    rules: {
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
      'import/no-default-export': 'error',
      // Enforce kebab-case naming for hook files
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/**/hooks/**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      // Detect manual query key construction - use @lukemorales/query-key-factory instead
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Property[key.name="queryKey"] > ArrayExpression',
          message:
            'Use query key factory (@lukemorales/query-key-factory) instead of manual query key construction.',
        },
      ],
    },
  },
  // Allow default exports for config files
  {
    files: ['**/*.config.{js,mjs,ts}', '**/eslint.config.{js,mjs}', '**/postcss.config.{js,mjs}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Disable max-lines rule for UI components - shadcn/ui components can legitimately be longer
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
    },
  },
  // Allow manual query keys in query factory files (this is where we define them)
  {
    files: ['**/queries/**/*.ts', '**/src/queries/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Allow manual query keys in generated hooks from OpenAPI
  {
    files: ['**/packages/react/src/hooks/**/*.ts', 'src/hooks/**/*.ts', 'hooks/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'check-file/filename-naming-convention': 'off', // Generated hooks use camelCase
    },
  },
]
