import { config } from '@repo/eslint-config/library'

export default [
  ...config,
  {
    ignores: ['**/gen/**', '**/*.gen.ts', '**/*.gen.js'],
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclarator[id.name=/^__dirname$|^__filename$/]',
          message:
            'Avoid CommonJS-style variable names. Use descriptive names like scriptDir or currentDir instead.',
        },
      ],
    },
  },
]
