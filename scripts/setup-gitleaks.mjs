#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const TOOL = {
  name: 'gitleaks',
  command: 'gitleaks',
  checkCommand: 'gitleaks version',
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
}

function checkToolExists(toolName, checkCommand) {
  try {
    execSync(checkCommand, { stdio: 'ignore' })
    return true
  } catch {
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

function installTool() {
  const os = getPlatform()
  const instructions = TOOL[os]
  const displayName = TOOL.name

  if (!instructions) {
    console.error(`\n⚠️  Cannot install ${displayName} on ${os}`)
    console.error(`Please install ${displayName} manually.`)
    return false
  }

  // macOS: Try brew first if available
  if (os === 'macos' && instructions.brew && checkBrewAvailable()) {
    try {
      console.log(`\n📦 Installing ${displayName} via Homebrew...`)
      execSync(instructions.brew, { stdio: 'inherit' })
      if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
        console.log(`✅ ${displayName} installed successfully`)
        return true
      }
    } catch (_error) {
      console.error(`\n⚠️  Homebrew installation failed, trying manual method...`)
    }
  }

  // Linux/macOS: Manual installation via wget
  if (instructions.getDownloadUrl) {
    try {
      const version = getLatestVersion(TOOL.repo)
      if (!version) {
        console.error(`\n❌ Failed to get latest version for ${displayName}`)
        if (instructions.manual) {
          console.error(`Please install manually: ${instructions.manual}`)
        }
        return false
      }

      const arch = getArchitecture()
      const downloadUrl = instructions.getDownloadUrl(version, arch)
      const isTarGz = downloadUrl.endsWith('.tar.gz')
      const tempFile = isTarGz ? `/tmp/${displayName}.tar.gz` : `/tmp/${displayName}`
      const binaryName = displayName

      console.log(`\n📦 Installing ${displayName} (version ${version})...`)
      console.log(`   Downloading from: ${downloadUrl}`)

      // Download - use curl if wget not available
      let downloadCommand
      try {
        execSync('which wget', { stdio: 'ignore' })
        downloadCommand = `wget -O ${tempFile} "${downloadUrl}"`
      } catch {
        if (!checkCurlAvailable()) {
          throw new Error('Neither wget nor curl is available. Please install one of them.')
        }
        downloadCommand = `curl -L -o ${tempFile} "${downloadUrl}"`
      }
      execSync(downloadCommand, { stdio: 'inherit' })

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
      if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
        console.log(`✅ ${displayName} installed successfully`)
        return true
      }
      console.error(`\n⚠️  ${displayName} installation completed but tool not found in PATH`)
      return false
    } catch (error) {
      console.error(`\n❌ Failed to install ${displayName}`)
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
    console.error(`\n⚠️  ${displayName} is not installed.`)
    console.error(`\nTo install ${displayName} on Windows:`)
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
  console.log('\n🔒 Setting up gitleaks (secret scanning tool)...\n')

  const isRequired = TOOL.required
  const displayName = TOOL.name

  if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
    try {
      const version = execSync(TOOL.checkCommand, { encoding: 'utf-8' }).trim()
      console.log(`✅ ${displayName} is already installed (${version})`)
    } catch {
      console.log(`✅ ${displayName} is already installed`)
    }
    console.log('\n✅ gitleaks setup complete!\n')
    exit(0)
  }

  console.log(`📥 ${displayName} is not installed${isRequired ? ' (required)' : ' (optional)'}`)

  const installed = installTool()

  if (installed) {
    console.log('\n✅ gitleaks setup complete!\n')
    exit(0)
  } else {
    if (isRequired) {
      console.error(`\n❌ ${displayName} is required but installation failed`)
      console.error('Please install gitleaks manually and try again.\n')
      exit(1)
    } else {
      console.log(`\n⚠️  ${displayName} installation skipped (optional)`)
      console.log('\n✅ gitleaks setup complete!\n')
      exit(0)
    }
  }
}

main()
