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

if (!checkToolExists('osv-scanner')) {
  console.error('\n⚠️  osv-scanner is not installed. Skipping vulnerability scan.')
  console.error('Install osv-scanner to enable pre-commit vulnerability scanning.')
  console.error('Run: pnpm setup:osv\n')
  exit(0)
}

try {
  console.log('\n🔍 Scanning dependencies for known vulnerabilities...\n')
  execSync('osv-scanner scan --lockfile=pnpm-lock.yaml --format=markdown', {
    stdio: 'inherit',
  })
  exit(0)
} catch (_error) {
  console.log('\n⚠️  Vulnerability scan found issues.')
  console.log('Please review the output above for details about affected packages.')
  console.log('Update or replace vulnerable dependencies, then try committing again.\n')
  exit(1)
}
