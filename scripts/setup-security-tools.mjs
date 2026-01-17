#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { exit } from 'node:process'

function main() {
  console.log('\n🔒 Setting up security tools...\n')
  console.log('This will install gitleaks and osv-scanner.\n')

  let hasErrors = false

  // Run gitleaks setup
  try {
    console.log('📦 Installing gitleaks...')
    execSync('node scripts/setup-gitleaks.mjs', { stdio: 'inherit' })
  } catch (_error) {
    console.error('\n❌ gitleaks setup failed')
    hasErrors = true
  }

  // Run osv-scanner setup
  try {
    console.log('\n📦 Installing osv-scanner...')
    execSync('node scripts/setup-osv-scanner.mjs', { stdio: 'inherit' })
  } catch (_error) {
    console.error('\n⚠️  osv-scanner setup failed (optional)')
    // osv-scanner is optional, so don't fail the whole setup
  }

  if (hasErrors) {
    console.error('\n❌ Security tools setup incomplete: Required tools failed to install')
    console.error('Please install the required tools manually and try again.\n')
    exit(1)
  }

  console.log('\n✅ Security tools setup complete!\n')
  exit(0)
}

main()
