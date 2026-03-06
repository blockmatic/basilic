import js from '@eslint/js'
import onlyWarn from 'eslint-plugin-only-warn'
import turboPlugin from 'eslint-plugin-turbo'
import globals from 'globals'
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
      // Enforce braceless single-statement blocks, braces for multi-statement
      curly: ['error', 'multi', 'consistent'],
      // Fail-fast: disallow else after return
      'no-else-return': 'error',
      // Limit block nesting depth
      'max-depth': ['error', 4],
      // Throw Error instances only (@repo/error)
      'no-throw-literal': 'error',
      // RORO: max 4 params encourages options objects
      'max-params': ['error', { max: 4 }],
      // Limit cyclomatic complexity
      complexity: ['warn', { max: 30 }],
      // Prefer interfaces over types for object definitions
      '@typescript-eslint/consistent-type-definitions': 'off',
      // Ban CommonJS globals (__dirname, __filename) - enforce ESM patterns
      'no-restricted-globals': [
        'error',
        {
          name: '__dirname',
          message: 'Use ESM pattern: const scriptDir = dirname(fileURLToPath(import.meta.url))',
        },
        {
          name: '__filename',
          message: 'Use ESM pattern: const scriptFile = fileURLToPath(import.meta.url)',
        },
      ],
      // Ban direct process.env access - enforce t3-env validation via lib/env.ts
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Never use process.env in app code. Always import { env } from lib/env.ts',
        },
      ],
      // Enforce type-only imports for better tree-shaking and bundling
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false, // Allow type annotations in dynamic imports (vi.importActual<typeof import('ai')>)
        },
      ],
      // Enforce naming conventions: no UPPER_SNAKE_CASE for variables (only env keys use uppercase)
      // See .cursor/rules/base/naming.mdc
      '@typescript-eslint/naming-convention': [
        'error',
        // Allow double underscore variables (CommonJS compatibility: __filename, __dirname, test globals)
        {
          selector: 'variable',
          filter: {
            regex: '^__',
            match: true,
          },
          format: null, // Allow any format for double underscore variables
        },
        // Variables: camelCase or PascalCase only—no UPPER_CASE (reserved for env vars)
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // Type-like: PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      // Ban TypeScript enums - prefer const objects or union types
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'Avoid enums. Use const objects or union types instead. See .cursor/rules/base/typescript.mdc',
        },
      ],
      // Enforce subpath imports for @repo packages
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/error',
              message:
                'Use subpath imports: @repo/error/nextjs, @repo/error/node, @repo/error/react, etc.',
            },
            {
              name: '@repo/utils',
              message:
                'Use subpath imports: @repo/utils/logger/server, @repo/utils/logger/client, @repo/utils/async, @repo/utils/web3, etc.',
            },
            // Note: @repo/core doesn't have subpath exports yet - restriction will be added when subpaths are implemented
            {
              name: '@repo/ui',
              message:
                'Use subpath imports: @repo/ui/components/*, @repo/ui/lib/utils, @repo/ui/radix, etc.',
            },
          ],
          patterns: [
            {
              group: ['@radix-ui/react-*'],
              message:
                'Import from @repo/ui/radix instead. See packages/ui/src/radix/index.tsx for available exports.',
            },
          ],
        },
      ],
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
  // Also allow type annotations in dynamic imports for Vitest mocking patterns
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.e2e-spec.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      '@typescript-eslint/consistent-type-imports': 'off', // Allow type annotations in vi.mock() patterns
    },
  },
  // Allow CommonJS globals in config files and scripts (they often need them for tooling)
  {
    files: [
      '**/*.config.{js,mjs,ts}',
      '**/vitest.setup.{ts,js}',
      '**/vitest.global-setup.{ts,js}',
      '**/scripts/**/*.ts',
      '**/scripts/**/*.js',
      '**/scripts/**/*.mjs',
      '**/test/**/*.ts',
      '**/test/**/*.js',
    ],
    rules: {
      'no-restricted-globals': 'off',
      // Allow __filename and __dirname naming in scripts/config files
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  // Node globals for standalone .mjs scripts (run with node, need process etc.)
  {
    files: ['**/scripts/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Allow process.env in env.ts files, logger files, error core, scripts, tests, email templates, instrumentation, and config files (infrastructure that reads env vars)
  {
    files: [
      '**/lib/env.ts',
      '**/env.ts',
      '**/load-env.ts',
      '**/logger/**/*.ts',
      'packages/error/src/core/**/*.ts',
      '**/scripts/**/*.ts',
      '**/scripts/**/*.js',
      '**/scripts/**/*.mjs',
      '**/test/**/*.ts',
      '**/test/**/*.js',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/*.e2e-spec.{ts,tsx}',
      '**/playwright-global-setup.ts', // Playwright test setup needs process.env for PLAYWRIGHT_REUSE_SERVER
      '**/e2e/**/*.ts', // E2E fixtures and helpers need process.env for PLAYWRIGHT_TEST_BASE_URL etc.
      'packages/email/**/*.{ts,tsx}', // Email templates need direct process.env access
      '**/instrumentation.ts', // Next.js instrumentation files need direct process.env access
    ],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  {
    files: [
      '**/*.config.{js,mjs,ts}',
      '**/vitest.setup.{ts,js}',
      '**/vitest.global-setup.{ts,js}',
      '**/playwright.config.{ts,js}',
      '**/drizzle.config.{ts,js}',
    ],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  // Allow direct Radix imports in UI package (this is where we centralize Radix imports)
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
]
