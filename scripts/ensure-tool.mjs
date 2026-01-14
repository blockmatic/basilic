#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const TOOL_INSTALL_INSTRUCTIONS = {
  gitleaks: {
    macos: {
      brew: 'brew install gitleaks',
      manual: 'https://github.com/gitleaks/gitleaks#macos',
    },
    linux: {
      install: `ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && wget -O /tmp/gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_\${ARCH}.tar.gz && tar -xzf /tmp/gitleaks.tar.gz -C /tmp && sudo mv /tmp/gitleaks /usr/local/bin/`,
      manual: 'https://github.com/gitleaks/gitleaks#linux',
    },
    win32: {
      chocolatey: 'choco install gitleaks',
      scoop: 'scoop install gitleaks',
      manual: 'https://github.com/gitleaks/gitleaks#windows',
    },
  },
  'osv-scanner': {
    macos: {
      brew: 'brew install osv-scanner',
      manual: 'https://google.github.io/osv-scanner/installation/',
    },
    linux: {
      install: `ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && wget -O /tmp/osv-scanner https://github.com/google/osv-scanner/releases/latest/download/osv-scanner_linux_\${ARCH} && chmod +x /tmp/osv-scanner && sudo mv /tmp/osv-scanner /usr/local/bin/`,
      manual: 'https://google.github.io/osv-scanner/installation/',
    },
    win32: {
      chocolatey: 'choco install osv-scanner',
      scoop: 'scoop install osv-scanner',
      manual: 'https://google.github.io/osv-scanner/installation/',
    },
  },
  trufflehog: {
    macos: {
      brew: 'brew install trufflesecurity/trufflehog/trufflehog',
      manual: 'https://github.com/trufflesecurity/trufflehog#installation',
    },
    linux: {
      install: `ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && TAG=$(curl -s https://api.github.com/repos/trufflesecurity/trufflehog/releases/latest | grep -oP '"tag_name":\\s*"\\K[^"]+' | sed 's/^v//') && wget -O /tmp/trufflehog.tar.gz https://github.com/trufflesecurity/trufflehog/releases/latest/download/trufflehog_\${TAG}_linux_\${ARCH}.tar.gz && tar -xzf /tmp/trufflehog.tar.gz -C /tmp && sudo mv /tmp/trufflehog /usr/local/bin/`,
      manual: 'https://github.com/trufflesecurity/trufflehog#installation',
    },
    win32: {
      chocolatey: 'choco install trufflehog',
      scoop: 'scoop install trufflehog',
      manual: 'https://github.com/trufflesecurity/trufflehog#installation',
    },
  },
}

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

function getPlatform() {
  const osPlatform = platform()
  if (osPlatform === 'darwin') return 'macos'
  if (osPlatform === 'linux') return 'linux'
  if (osPlatform === 'win32') return 'win32'
  return 'linux'
}

function printInstallInstructions(toolName) {
  const os = getPlatform()
  const instructions = TOOL_INSTALL_INSTRUCTIONS[toolName]?.[os]

  if (!instructions) {
    console.error(`\n⚠️  ${toolName} is not installed.`)
    console.error(`Please install ${toolName} manually.`)
    return
  }

  console.error(`\n⚠️  ${toolName} is not installed.`)
  console.error(
    `\nTo install ${toolName} on ${os === 'macos' ? 'macOS' : os === 'win32' ? 'Windows' : 'Linux'}:`,
  )

  if (instructions.brew) {
    console.error(`  ${instructions.brew}`)
  }
  if (instructions.chocolatey) {
    console.error(`  ${instructions.chocolatey}`)
  }
  if (instructions.scoop) {
    console.error(`  ${instructions.scoop}`)
  }
  if (instructions.install) {
    console.error(`  ${instructions.install}`)
  }

  if (instructions.manual) {
    console.error(`\nFor more options, see: ${instructions.manual}`)
  }
}

const toolName = process.argv[2]

if (!toolName) {
  console.error('Usage: node ensure-tool.mjs <tool-name>')
  exit(1)
}

if (!checkToolExists(toolName)) {
  printInstallInstructions(toolName)
  exit(0)
}

exit(0)
