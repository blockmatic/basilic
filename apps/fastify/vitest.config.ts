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
if (existsSync(envTestFile)) {
  config({ path: envTestFile })
}

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
    include: ['**/*.spec.ts'],
    exclude: ['**/e2e/**', '**/*.e2e.spec.ts', '**/node_modules/**', '**/packages/email/**'],
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./vitest.global-setup.ts'],
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
