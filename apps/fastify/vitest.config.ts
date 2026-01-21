import { existsSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import type { Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname)

// Set required environment variables BEFORE loading .env file
// This ensures env.ts validation passes when imported during test initialization
// GitHub Actions sets DATABASE_URL at job level, but we need it before dotenv runs
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://localhost/test'
}
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = '0000000000000000000000000000000000000000000000000000000000000000'
}

// Load .env file before any code runs
// This ensures env vars are available when env.ts is imported
// Note: For dev/prod, Node's --env-file is used in package.json scripts
// For tests, we load it here since vitest doesn't support --env-file natively
config({ path: resolve(projectRoot, '.env') })

const resolveJsToTsPlugin = (): Plugin => ({
  name: 'resolve-js-to-ts',
  enforce: 'pre',
  async resolveId(id, importer) {
    // Skip node_modules and non-.js files
    if (id.includes('node_modules') || !id.endsWith('.js')) {
      return null
    }

    let tsPath: string | null = null

    // Handle relative imports (e.g., './env.js' or '../lib/env.js')
    if (id.startsWith('.')) {
      if (!importer) return null
      // Clean Vite virtual paths like /@id/ or /@fs/
      const cleanImporter = importer.replace(/^\/@(id|fs)\//, '')
      const importerDir = dirname(cleanImporter)
      tsPath = resolve(importerDir, id.replace(/\.js$/, '.ts'))
    }
    // Handle absolute file system paths (this is the key case!)
    else if (isAbsolute(id)) {
      // Only process paths within project
      if (id.startsWith(projectRoot)) {
        tsPath = id.replace(/\.js$/, '.ts')
      } else {
        return null
      }
    }
    // Handle Vite virtual paths (e.g., '/src/lib/env.js')
    else if (id.startsWith('/') && !id.startsWith('/@')) {
      tsPath = resolve(projectRoot, id.replace(/\.js$/, '.ts'))
    } else {
      return null
    }

    // Return .ts path if it exists
    if (tsPath && existsSync(tsPath)) {
      return tsPath
    }

    return null
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

      if (changed) {
        return { code: transformed, map: null }
      }
    }
    return null
  },
})

export default defineConfig({
  plugins: [resolveJsToTsPlugin(), tsconfigPaths()],
  test: {
    include: ['**/*.{test,spec,e2e-spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30 seconds for API calls
    hookTimeout: 30000, // 30 seconds for hooks (database initialization)
  },
  resolve: {
    // Order matters: try .ts first, then .js
    extensions: ['.ts', '.mts', '.tsx', '.js', '.mjs', '.jsx', '.json'],
    alias: [
      {
        // Strip .js extension from relative imports to allow .ts resolution
        // This handles imports like '../lib/env.js' -> '../lib/env' -> '../lib/env.ts'
        find: /^(\.\.?\/[^'"]*?)\.js$/,
        replacement: '$1',
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
      ],
    },
  },
  optimizeDeps: {
    exclude: [],
  },
})
