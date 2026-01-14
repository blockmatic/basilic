#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const TOOLS = {
  gitleaks: {
    required: true,
    repo: 'gitleaks/gitleaks',
    macos: {
      brew: 'brew install gitleaks',
      getDownloadUrl: (version, arch) => {
        const normalizedArch = normalizeArchForGitleaks(arch)
        return `https://github.com/gitleaks/gitleaks/releases/download/v${version}/gitleaks_${version}_darwin_${normalizedArch}.tar.gz`
      },
      manual: 'https://github.com/gitleaks/gitleaks#macos',
    },
    linux: {
      getDownloadUrl: (version, arch) => {
        const normalizedArch = normalizeArchForGitleaks(arch)
        return `https://github.com/gitleaks/gitleaks/releases/download/v${version}/gitleaks_${version}_linux_${normalizedArch}.tar.gz`
      },
      manual: 'https://github.com/gitleaks/gitleaks#linux',
    },
    win32: {
      chocolatey: 'choco install gitleaks',
      scoop: 'scoop install gitleaks',
      manual: 'https://github.com/gitleaks/gitleaks#windows',
    },
  },
  'osv-scanner': {
    required: false,
    repo: 'google/osv-scanner',
    macos: {
      brew: 'brew install osv-scanner',
      getDownloadUrl: (version, arch) => {
        const normalizedArch = normalizeArchForOSV(arch)
        return `https://github.com/google/osv-scanner/releases/download/v${version}/osv-scanner_darwin_${normalizedArch}`
      },
      manual: 'https://google.github.io/osv-scanner/installation/',
    },
    linux: {
      getDownloadUrl: (version, arch) => {
        const normalizedArch = normalizeArchForOSV(arch)
        return `https://github.com/google/osv-scanner/releases/download/v${version}/osv-scanner_linux_${normalizedArch}`
      },
      manual: 'https://google.github.io/osv-scanner/installation/',
    },
    win32: {
      chocolatey: 'choco install osv-scanner',
      scoop: 'scoop install osv-scanner',
      manual: 'https://google.github.io/osv-scanner/installation/',
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

function checkBrewAvailable() {
  try {
    execSync('which brew', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function checkCurlAvailable() {
  try {
    execSync('which curl', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function getLatestVersion(repo) {
  if (!checkCurlAvailable()) {
    console.error('curl is required to fetch latest versions but is not installed')
    return null
  }

  try {
    const url = `https://api.github.com/repos/${repo}/releases/latest`
    const response = execSync(`curl -s "${url}"`, { encoding: 'utf-8' })
    const data = JSON.parse(response)
    // Remove 'v' prefix if present
    return data.tag_name.replace(/^v/, '')
  } catch (error) {
    console.error(`Failed to get latest version for ${repo}: ${error.message}`)
    return null
  }
}

function getArchitecture() {
  try {
    const arch = execSync('uname -m', { encoding: 'utf-8' }).trim()
    return arch
  } catch {
    return 'x86_64'
  }
}

function normalizeArchForGitleaks(arch) {
  if (arch === 'x86_64') return 'x64'
  if (arch === 'aarch64') return 'arm64'
  return arch === 'x64' || arch === 'arm64' ? arch : 'x64'
}

function normalizeArchForOSV(arch) {
  if (arch === 'x86_64') return 'amd64'
  if (arch === 'aarch64') return 'arm64'
  return arch === 'amd64' || arch === 'arm64' ? arch : 'amd64'
}

function installTool(toolName, toolConfig) {
  const os = getPlatform()
  const instructions = toolConfig[os]

  if (!instructions) {
    console.error(`\n⚠️  Cannot install ${toolName} on ${os}`)
    console.error(`Please install ${toolName} manually.`)
    return false
  }

  // macOS: Try brew first if available
  if (os === 'macos' && instructions.brew && checkBrewAvailable()) {
    try {
      console.log(`\n📦 Installing ${toolName} via Homebrew...`)
      execSync(instructions.brew, { stdio: 'inherit' })
      if (checkToolExists(toolName)) {
        console.log(`✅ ${toolName} installed successfully`)
        return true
      }
    } catch (_error) {
      console.error(`\n⚠️  Homebrew installation failed, trying manual method...`)
    }
  }

  // Linux/macOS: Manual installation via wget
  if (instructions.getDownloadUrl) {
    try {
      const version = getLatestVersion(toolConfig.repo)
      if (!version) {
        console.error(`\n❌ Failed to get latest version for ${toolName}`)
        if (instructions.manual) {
          console.error(`Please install manually: ${instructions.manual}`)
        }
        return false
      }

      const arch = getArchitecture()
      const downloadUrl = instructions.getDownloadUrl(version, arch)
      const isTarGz = downloadUrl.endsWith('.tar.gz')
      const tempFile = isTarGz ? `/tmp/${toolName}.tar.gz` : `/tmp/${toolName}`
      const binaryName = toolName

      console.log(`\n📦 Installing ${toolName} (version ${version})...`)
      console.log(`   Downloading from: ${downloadUrl}`)

      // Download
      execSync(`wget -O ${tempFile} "${downloadUrl}"`, { stdio: 'inherit' })

      // Extract if tar.gz
      if (isTarGz) {
        execSync(`tar -xzf ${tempFile} -C /tmp`, { stdio: 'inherit' })
      } else {
        // Make executable
        execSync(`chmod +x ${tempFile}`, { stdio: 'ignore' })
      }

      // Move to /usr/local/bin
      const sourcePath = isTarGz ? `/tmp/${binaryName}` : tempFile
      execSync(`sudo mv ${sourcePath} /usr/local/bin/`, { stdio: 'inherit' })

      // Verify installation
      if (checkToolExists(toolName)) {
        console.log(`✅ ${toolName} installed successfully`)
        return true
      }
      console.error(`\n⚠️  ${toolName} installation completed but tool not found in PATH`)
      return false
    } catch (error) {
      console.error(`\n❌ Failed to install ${toolName}`)
      if (error.message) {
        console.error(`Error: ${error.message}`)
      }
      if (instructions.manual) {
        console.error(`\nPlease install manually: ${instructions.manual}`)
      }
      return false
    }
  }

  // Windows: Print instructions (can't auto-install without admin)
  if (os === 'win32') {
    console.error(`\n⚠️  ${toolName} is not installed.`)
    console.error(`\nTo install ${toolName} on Windows:`)
    if (instructions.chocolatey) {
      console.error(`  ${instructions.chocolatey}`)
    }
    if (instructions.scoop) {
      console.error(`  ${instructions.scoop}`)
    }
    if (instructions.manual) {
      console.error(`\nFor more options, see: ${instructions.manual}`)
    }
    return false
  }

  return false
}

function main() {
  console.log('\n🔒 Setting up security tools...\n')

  let hasErrors = false
  const results = []

  for (const [toolName, toolConfig] of Object.entries(TOOLS)) {
    const isRequired = toolConfig.required

    if (checkToolExists(toolName)) {
      console.log(`✅ ${toolName} is already installed`)
      results.push({ tool: toolName, status: 'already-installed' })
      continue
    }

    console.log(`\n📥 ${toolName} is not installed${isRequired ? ' (required)' : ' (optional)'}`)

    const installed = installTool(toolName, toolConfig)

    if (installed) {
      results.push({ tool: toolName, status: 'installed' })
    } else {
      results.push({ tool: toolName, status: 'failed' })
      if (isRequired) {
        hasErrors = true
        console.error(`\n❌ ${toolName} is required but installation failed`)
      } else {
        console.log(`\n⚠️  ${toolName} installation skipped (optional)`)
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 Installation Summary:')
  console.log('='.repeat(50))

  for (const result of results) {
    const toolConfig = TOOLS[result.tool]
    const required = toolConfig.required ? ' (required)' : ' (optional)'
    const status =
      result.status === 'already-installed'
        ? '✅ Already installed'
        : result.status === 'installed'
          ? '✅ Installed'
          : result.status === 'failed'
            ? '❌ Failed'
            : '❓ Unknown'

    console.log(`  ${result.tool}${required}: ${status}`)
  }

  console.log(`${'='.repeat(50)}\n`)

  if (hasErrors) {
    console.error('❌ Setup incomplete: Required tools failed to install')
    console.error('Please install the required tools manually and try again.\n')
    exit(1)
  }

  console.log('✅ Security tools setup complete!\n')
  exit(0)
}

main()
