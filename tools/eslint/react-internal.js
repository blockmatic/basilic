import js from '@eslint/js'
import pluginImport from 'eslint-plugin-import'
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
export const config = [
  ...baseConfig,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      import: pluginImport,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // Disable React Compiler rules if not using React Compiler
      // These are enabled by default in eslint-plugin-react-hooks v7+
      'react-hooks/compiler': 'off',
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
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Prefer ternaries over && in JSX
      'react/jsx-no-leaked-render': 'off',
      // Enforce one component per file - helps agents maintain component separation
      // Allow stateless (functional) components in the same file for utility/helper components
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      // Enforce named exports for React components
      'import/no-default-export': 'error',
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
]
