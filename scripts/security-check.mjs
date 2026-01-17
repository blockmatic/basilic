#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { exit } from 'node:process'

function checkToolExists(toolName) {
  try {
    execSync(`which ${toolName}`, { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync(`where ${toolName}`, { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
}

function main() {
  console.log('\n🔒 Running comprehensive security checks...\n')

  let hasErrors = false

  // 1. Block secret files
  try {
    console.log('1️⃣  Checking for blocked secret files...')
    execSync('node scripts/block-secret-files.mjs', { stdio: 'inherit' })
    console.log('   ✅ No blocked files detected\n')
  } catch (_error) {
    console.log('   ⚠️  Blocked files detected\n')
    hasErrors = true
  }

  // 2. Scan for secrets
  if (checkToolExists('gitleaks')) {
    try {
      console.log('2️⃣  Scanning for secrets in repository...')
      execSync('gitleaks detect --redact --verbose --config .gitleaks.toml', {
        stdio: 'inherit',
      })
      console.log('   ✅ No secrets detected\n')
    } catch (_error) {
      console.log('   ⚠️  Secrets detected\n')
      hasErrors = true
    }
  } else {
    console.log('2️⃣  Skipping secret scan (gitleaks not installed)')
    console.log('   Run: pnpm setup:gitleaks\n')
  }

  // 3. Scan for vulnerabilities
  if (checkToolExists('osv-scanner')) {
    try {
      console.log('3️⃣  Scanning dependencies for vulnerabilities...')
      execSync('osv-scanner scan --lockfile=pnpm-lock.yaml --format=markdown', {
        stdio: 'inherit',
      })
      console.log('   ✅ No vulnerabilities detected\n')
    } catch (_error) {
      console.log('   ⚠️  Vulnerabilities detected\n')
      hasErrors = true
    }
  } else {
    console.log('3️⃣  Skipping vulnerability scan (osv-scanner not installed)')
    console.log('   Run: pnpm setup:osv\n')
  }

  // 4. Run pnpm audit
  try {
    console.log('4️⃣  Running pnpm audit...')
    execSync('pnpm audit --audit-level=moderate', { stdio: 'inherit' })
    console.log('   ✅ Audit passed\n')
  } catch (_error) {
    console.log('   ⚠️  Audit found issues\n')
    hasErrors = true
  }

  if (hasErrors) {
    console.log('\n⚠️  Security checks found issues. Please review and fix the issues above.\n')
    exit(1)
  }

  console.log('\n✅ All security checks passed!\n')
  exit(0)
}

main()
