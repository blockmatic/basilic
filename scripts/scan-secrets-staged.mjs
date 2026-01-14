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

if (!checkToolExists('gitleaks')) {
  console.error('\n⚠️  gitleaks is not installed. Skipping secret scan.')
  console.error('Install gitleaks to enable pre-commit secret scanning.')
  console.error('Run: node scripts/ensure-tool.mjs gitleaks\n')
  exit(0)
}

try {
  execSync('gitleaks protect --staged --redact --verbose --config .gitleaks.toml', {
    stdio: 'inherit',
  })
  exit(0)
} catch (error) {
  console.error(
    '\n❌ Secret scan failed. Please review and remove any secrets before committing.\n',
  )
  if (error.message) {
    console.error(`Error details: ${error.message}`)
  }
  exit(1)
}
