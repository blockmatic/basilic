#!/usr/bin/env node

/**
 * Validates environment configuration files to prevent deployment with placeholder values.
 * This script checks that NEXT_PUBLIC_API_URL is not a placeholder in production.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const PRODUCTION_ENV_PATH = join(rootDir, 'apps/web/.env.production')
const PLACEHOLDER_URL = 'https://api.example.com'

function validateProductionEnv() {
  try {
    const content = readFileSync(PRODUCTION_ENV_PATH, 'utf-8')
    const lines = content.split('\n')

    for (const line of lines) {
      // Skip comments and empty lines
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue
      }

      if (trimmedLine.startsWith('NEXT_PUBLIC_API_URL=')) {
        // Extract value, handling quotes and comments
        // Use indexOf to only split on the first '=' to preserve values containing '='
        const equalsIndex = trimmedLine.indexOf('=')
        const value = trimmedLine
          .substring(equalsIndex + 1)
          .trim()
          .replace(/^["']|["']$/g, '') // Remove surrounding quotes
          .split('#')[0]
          ?.trim() // Remove inline comments

        if (!value || value === PLACEHOLDER_URL) {
          console.error(
            `❌ ERROR: NEXT_PUBLIC_API_URL in .env.production is set to placeholder "${PLACEHOLDER_URL}" or is empty.`,
          )
          console.error(
            '   This must be replaced with the real production API endpoint before deployment.',
          )
          process.exit(1)
        }
        console.log(`✅ NEXT_PUBLIC_API_URL is set to: ${value}`)
        return
      }
    }

    console.error('❌ ERROR: NEXT_PUBLIC_API_URL not found in .env.production')
    process.exit(1)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ ERROR: ${PRODUCTION_ENV_PATH} not found`)
      process.exit(1)
    }
    throw error
  }
}

// Always validate in production builds or CI/CD environments
// Skip only in development unless explicitly requested
const isProduction = process.env.NODE_ENV === 'production'
const isCI = process.env.CI === 'true'
const shouldValidate = process.env.VALIDATE_ENV === 'true'

if (isProduction || isCI || shouldValidate) {
  validateProductionEnv()
} else {
  console.log(
    'ℹ️  Skipping env validation (set NODE_ENV=production, CI=true, or VALIDATE_ENV=true to enable)',
  )
}
