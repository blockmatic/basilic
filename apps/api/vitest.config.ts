import { existsSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import type { Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const configFile = fileURLToPath(import.meta.url)
const configDir = dirname(configFile)
const projectRoot = resolve(configDir)

// Load .env.test for tests (before env.ts validation runs)
const envTestFile = resolve(projectRoot, '.env.test')
if (existsSync(envTestFile)) config({ path: envTestFile })
// Ensure tests run against the default model only (no AI_DEFAULT_MODEL override)
Reflect.deleteProperty(process.env, 'AI_DEFAULT_MODEL')
const testEnvDefaults: [string, string][] = [
  ['WEBAUTHN_RP_NAME', 'Test App'],
  ['TOTP_ISSUER', 'Test App'],
  ['RATE_LIMIT_MAX', '10000'],
]
for (const [k, v] of testEnvDefaults) process.env[k] = process.env[k] ?? v

const oauthEnvKeys = [
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'OAUTH_GITHUB_CALLBACK_URL',
  'OAUTH_GITHUB_CALLBACK_URLS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OAUTH_GOOGLE_CALLBACK_URL',
  'OAUTH_GOOGLE_CALLBACK_URLS',
  'FACEBOOK_CLIENT_ID',
  'FACEBOOK_CLIENT_SECRET',
  'OAUTH_FACEBOOK_CALLBACK_URL',
  'OAUTH_FACEBOOK_CALLBACK_URLS',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'OAUTH_TWITTER_CALLBACK_URL',
  'OAUTH_TWITTER_CALLBACK_URLS',
] as const
for (const key of oauthEnvKeys) Reflect.deleteProperty(process.env, key)

function toTsPath(id: string, importer?: string): string | null {
  if (!id.endsWith('.js') || id.includes('node_modules')) return null
  let tsPath: string | null = null
  if (id.startsWith('.')) {
    if (!importer) return null
    const cleanImporter = importer.replace(/^\/@(id|fs)\//, '')
    tsPath = resolve(dirname(cleanImporter), id.replace(/\.js$/, '.ts'))
  } else if (isAbsolute(id)) {
    if (id.startsWith(projectRoot)) tsPath = id.replace(/\.js$/, '.ts')
  } else if (id.startsWith('/') && !id.startsWith('/@')) {
    tsPath = resolve(projectRoot, id.replace(/\.js$/, '.ts'))
  } else if (id.startsWith('file://')) {
    const pathPart = id.slice(7)
    if (pathPart.startsWith(projectRoot) && pathPart.endsWith('.js'))
      tsPath = pathPart.replace(/\.js$/, '.ts')
  }
  return tsPath && existsSync(tsPath) ? tsPath : null
}

const resolveJsToTsPlugin = (): Plugin => ({
  name: 'resolve-js-to-ts',
  enforce: 'pre',
  async resolveId(id, importer) {
    const tsPath = toTsPath(id, importer)
    return tsPath ?? null
  },
  // Transform import statements to rewrite .js to .ts - CRITICAL: This must run before Node resolves
  transform(code, id) {
    // Transform all TypeScript files in the project (not node_modules)
    if (
      !id.includes('node_modules') &&
      id.startsWith(projectRoot) &&
      (id.endsWith('.ts') || id.endsWith('.tsx'))
    ) {
      let transformed = code
      let changed = false

      // Rewrite all relative .js imports to .ts if the .ts file exists
      transformed = transformed.replace(
        /from\s+['"](\.\.?\/[^'"]*?)\.js(['"])/g,
        (match, path, quote) => {
          const tsPath = resolve(dirname(id), `${path}.ts`)
          if (existsSync(tsPath)) {
            changed = true
            return `from ${quote}${path}.ts${quote}`
          }
          return match
        },
      )

      // Also handle import statements without 'from'
      transformed = transformed.replace(
        /import\s+['"](\.\.?\/[^'"]*?)\.js(['"])/g,
        (match, path, quote) => {
          const tsPath = resolve(dirname(id), `${path}.ts`)
          if (existsSync(tsPath)) {
            changed = true
            return `import ${quote}${path}.ts${quote}`
          }
          return match
        },
      )

      // Handle dynamic imports
      transformed = transformed.replace(
        /import\s*\(\s*['"](\.\.?\/[^'"]*?)\.js(['"])\s*\)/g,
        (match, path, quote) => {
          const tsPath = resolve(dirname(id), `${path}.ts`)
          if (existsSync(tsPath)) {
            changed = true
            return `import(${quote}${path}.ts${quote})`
          }
          return match
        },
      )

      if (changed) return { code: transformed, map: null }
    }
    return null
  },
})

export default defineConfig({
  plugins: [resolveJsToTsPlugin(), tsconfigPaths()],
  test: {
    include: ['**/*.spec.ts'],
    exclude: ['**/e2e/**', '**/*.e2e.spec.ts', '**/node_modules/**', '**/packages/email/**'],
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./vitest.global-setup.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30 seconds for API calls
    hookTimeout: 30000, // 30 seconds for hooks (database initialization)
    // PGLite/WASM is unstable with parallel workers - use single worker, sequential files
    fileParallelism: false,
    maxWorkers: 1,
    sequence: { concurrent: false },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        '**/*.{test,spec}.ts',
        '**/*.md',
        'src/db/migrations/**',
        'src/routes/reference/template*.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
  },
  resolve: {
    // Order matters: try .ts first, then .js
    extensions: ['.ts', '.mts', '.tsx', '.js', '.mjs', '.jsx', '.json'],
    alias: [
      {
        find: '@test/utils',
        replacement: resolve(projectRoot, 'test/utils'),
      },
      {
        // Strip .js extension from relative imports to allow .ts resolution
        // This handles imports like '../lib/env.js' -> '../lib/env' -> '../lib/env.ts'
        find: /^(\.\.?\/[^'"]*?)\.js$/,
        replacement: '$1',
      },
      {
        // Resolve db/index.js to .ts (fixes auth plugin and other imports when loaded via autoload)
        find: /^(.*\/)db\/index\.js$/,
        replacement: '$1db/index.ts',
      },
      {
        // Handle absolute paths within src directory
        find: new RegExp(`^${projectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/src/(.*)\\.js$`),
        replacement: `${projectRoot}/src/$1`,
      },
    ],
  },
  server: {
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'],
    },
    // Force Vite to process all local source files instead of using Node's native ESM loader
    deps: {
      inline: [
        // Inline all local source files so they go through Vite's transform pipeline
        /^\/.*\/src\/.*/,
        /^\.\.\/.*/,
        /^\.\/.*/,
        // Ensure React Email packages are processed by Vite
        /@repo\/email/,
        /@react-email/,
      ],
    },
  },
  optimizeDeps: {
    // Include React and react-dom so they're available when @react-email/render needs them
    include: ['react', 'react-dom', '@react-email/render', '@react-email/components'],
    exclude: [],
  },
})
