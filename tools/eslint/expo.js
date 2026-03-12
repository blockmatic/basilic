import js from '@eslint/js'
import pluginCheckFile from 'eslint-plugin-check-file'
import pluginImport from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { config as baseConfig } from './base.js'

/**
 * ESLint configuration for Expo/React Native apps - Correctness-only rules.
 *
 * Extends base config and adds React + React Hooks.
 * Expo Router layouts/screens allow default export.
 * No Next.js rules.
 *
 * @type {import("eslint").Linter.Config}
 */
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
        ...globals.browser,
      },
    },
  },
  {
    files: reactFiles,
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
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
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/**/hooks/**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
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
  // Allow default export for Expo Router layouts and screens
  {
    files: [
      '**/app/**/_layout.tsx',
      '**/app/**/*.tsx',
      '**/src/app/**/_layout.tsx',
      '**/src/app/**/*.tsx',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Allow default export for config files
  {
    files: ['**/*.config.{js,mjs,ts}', '**/eslint.config.{js,mjs}', '**/postcss.config.{js,mjs}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Disable max-lines for components
  {
    files: ['**/components/**/*.{ts,tsx}', '**/src/components/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
    },
  },
  // Allow manual query keys in query factory files
  {
    files: ['**/queries/**/*.ts', '**/src/queries/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Allow manual query keys in hooks
  {
    files: ['**/packages/react/src/hooks/**/*.ts', '**/src/hooks/**/*.ts', '**/hooks/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'check-file/filename-naming-convention': 'off',
    },
  },
  // Metro config is CommonJS (require, __dirname, module.exports) - required by Expo
  {
    files: ['metro.config.{js,cjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-globals': 'off',
      'no-undef': 'off',
    },
  },
  // Node scripts (run from apps/mobile, paths like scripts/**)
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
  // RN/Expo: require() for assets, process.env, default exports, naming (INITIAL_SCALE_FACTOR, experimental_*)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-properties': 'off',
      'import/no-default-export': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
]
