import js from '@eslint/js'
import pluginNext from '@next/eslint-plugin-next'
import pluginCheckFile from 'eslint-plugin-check-file'
import pluginImport from 'eslint-plugin-import-x'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { config as baseConfig } from './base.js'

// Note: eslint-plugin-react-server-components has ESM compatibility issues
// Temporarily disabled until fixed upstream
// See: https://github.com/Pyr33x/eslint-plugin-react-server-components/issues
let pluginReactServer = null
try {
  pluginReactServer = await import('eslint-plugin-react-server-components')
  pluginReactServer = pluginReactServer.default || pluginReactServer
} catch {
  // Plugin not available or has compatibility issues
}

/**
 * ESLint configuration for Next.js applications - Correctness-only rules.
 *
 * This config extends the base config and adds:
 * - Next.js specific rules (@next/eslint-plugin-next)
 * - React and React Hooks rules
 * - Import boundary enforcement (no-default-export with Next.js exceptions)
 *
 * Biome handles formatting and stylistic linting.
 * ESLint focuses on correctness: TypeScript, React, Next.js, and architecture rules.
 *
 * @type {import("eslint").Linter.Config}
 * */
const reactFiles = ['**/*.{jsx,tsx}']

export const nextJsConfig = [
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
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      ...(pluginReactServer && { 'react-server-components': pluginReactServer }),
      'check-file': pluginCheckFile,
      import: pluginImport,
    },
    settings: { react: { version: '19.2' } },
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
      // Enforce function declaration syntax for named components
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'function-expression',
        },
      ],
      // Enforce named exports, except for Next.js pages and layouts
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
      // Detect unnecessary 'use client' directives (only if plugin is available)
      ...(pluginReactServer && {
        'react-server-components/no-unnecessary-use-client': 'warn',
      }),
    },
  },
  // Allow default exports for Next.js pages and layouts
  {
    files: ['**/app/**/page.tsx', '**/app/**/layout.tsx', '**/pages/**/*.tsx'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Allow default exports for config files
  {
    files: ['**/*.config.{js,mjs,ts}', '**/eslint.config.{js,mjs}', '**/postcss.config.{js,mjs}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Node.js globals for Next.js config (runs in Node at build time)
  {
    files: ['**/next.config.{js,mjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Disable max-lines rule for UI components - complex component implementations legitimately need more lines
  {
    files: ['**/components/**/*.{ts,tsx}'],
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
  {
    ignores: ['next-env.d.ts'],
  },
]
