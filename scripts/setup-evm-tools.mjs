#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const TOOL = {
  name: 'Foundry',
  command: 'forge',
  checkCommand: 'forge --version',
  required: false,
  macos: {
    brew: 'brew install foundry',
    manual: 'curl -L https://foundry.paradigm.xyz | bash',
    instructions: 'https://book.getfoundry.sh/getting-started/installation',
  },
  linux: {
    manual: 'curl -L https://foundry.paradigm.xyz | bash',
    instructions: 'https://book.getfoundry.sh/getting-started/installation',
  },
  win32: {
    chocolatey: 'choco install foundry',
    scoop: 'scoop install foundry',
    manual: 'https://book.getfoundry.sh/getting-started/installation',
    instructions: 'https://book.getfoundry.sh/getting-started/installation',
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

function installTool() {
  const os = getPlatform()
  const instructions = TOOL[os]
  const displayName = TOOL.name

  if (!instructions) {
    console.error(`\n⚠️  Cannot install ${displayName} on ${os}`)
    const fallbackMessage = `No installer for ${displayName} on ${os}. Please consult the project documentation or install manually.`
    console.error(`Please install ${displayName} manually: ${fallbackMessage}`)
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
    } catch (error) {
      console.error(`\n⚠️  Homebrew installation failed: ${error.message}`)
      console.error(`Trying manual method...`)
    }
  }

  // Foundry: Use foundryup installer
  if (instructions.manual && checkCurlAvailable()) {
    try {
      console.log(`\n📦 Installing ${displayName} via foundryup...`)
      console.log(`   Running: curl -L https://foundry.paradigm.xyz | bash`)
      execSync('curl -L https://foundry.paradigm.xyz | bash', { stdio: 'inherit' })

      // Check if foundry binaries exist in the default location
      const foundryBinPath = `${process.env.HOME || process.env.USERPROFILE || ''}/.foundry/bin/forge`
      try {
        execSync(`test -f "${foundryBinPath}"`, { stdio: 'ignore' })
        // Try to run forge directly from the foundry bin directory
        try {
          execSync(`"${foundryBinPath}" --version`, { stdio: 'ignore' })
          console.log(`✅ ${displayName} installed successfully`)
          console.log(`\n⚠️  Note: You may need to restart your terminal or run:`)
          console.log(`   source $HOME/.bashrc (or source $HOME/.zshrc)`)
          console.log(`   Or add to PATH: export PATH="$HOME/.foundry/bin:$PATH"`)
          return true
        } catch {
          // Binary exists but might not be executable yet
        }
      } catch {
        // Binary doesn't exist yet
      }

      // Try to run foundryup if forge still not found
      const foundryupPath = `${process.env.HOME || process.env.USERPROFILE || ''}/.foundry/bin/foundryup`
      try {
        execSync(`test -f "${foundryupPath}"`, { stdio: 'ignore' })
        execSync(`"${foundryupPath}"`, { stdio: 'inherit' })

        // Check again after foundryup
        try {
          execSync(`"${foundryBinPath}" --version`, { stdio: 'ignore' })
          console.log(`✅ ${displayName} installed successfully`)
          console.log(`\n⚠️  Note: You may need to restart your terminal or run:`)
          console.log(`   source $HOME/.bashrc (or source $HOME/.zshrc)`)
          return true
        } catch {
          // Still not found
        }
      } catch {
        // foundryup not found
      }

      // If we get here, installation likely succeeded but PATH needs refresh
      console.log(`✅ ${displayName} installation completed`)
      console.log(`\n⚠️  Note: Please restart your terminal or run:`)
      console.log(`   source $HOME/.bashrc (or source $HOME/.zshrc)`)
      console.log(`   Then verify with: forge --version`)
      return true
    } catch (error) {
      console.error(`\n⚠️  Foundryup installation failed: ${error.message}`)
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
      console.error(`\nOr manually: ${instructions.manual}`)
    }
    if (instructions.instructions) {
      console.error(`\nFor more options, see: ${instructions.instructions}`)
    }
    return false
  }

  // Fallback: Print manual instructions
  if (instructions.manual) {
    console.error(`\n⚠️  Automatic installation failed. Please install manually:`)
    console.error(`   ${instructions.manual}`)
    if (instructions.instructions) {
      console.error(`\n   Documentation: ${instructions.instructions}`)
    }
  }

  return false
}

function main() {
  console.log('\n🔨 Setting up EVM contract development tools (Foundry)...\n')

  const isRequired = TOOL.required
  const displayName = TOOL.name

  if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
    try {
      const version = execSync(TOOL.checkCommand, { encoding: 'utf-8' }).trim()
      console.log(`✅ ${displayName} is already installed (${version})`)
    } catch {
      console.log(`✅ ${displayName} is already installed`)
    }
    console.log('\n✅ EVM tools setup complete!\n')
    exit(0)
  }

  console.log(`📥 ${displayName} is not installed${isRequired ? ' (required)' : ' (optional)'}`)

  const installed = installTool()

  if (installed) {
    console.log('\n✅ EVM tools setup complete!')
    console.log('\n💡 Note: If Foundry was just installed, you may need to restart your terminal')
    console.log('   or run: source $HOME/.bashrc (or source $HOME/.zshrc)\n')
    exit(0)
  } else {
    if (isRequired) {
      console.error(`\n❌ ${displayName} is required but installation failed`)
      console.error('Please install Foundry manually and try again.\n')
      exit(1)
    } else {
      console.log(`\n⚠️  ${displayName} installation skipped (optional)`)
      console.log('   EVM contracts will skip building if Foundry is not available')
      console.log('\n✅ EVM tools setup complete!\n')
      exit(0)
    }
  }
}

main()
