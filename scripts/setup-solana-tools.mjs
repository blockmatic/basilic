#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const TOOL = {
  name: 'Anchor',
  command: 'anchor',
  checkCommand: 'anchor --version',
  required: false,
  macos: {
    brew: 'brew install anchor-lang/anchor/anchor',
    manual: 'avm install latest && avm use latest',
    instructions: 'https://www.anchor-lang.com/docs/installation',
  },
  linux: {
    manual:
      'cargo install --git https://github.com/coral-xyz/anchor avm --locked --force && avm install latest && avm use latest',
    instructions: 'https://www.anchor-lang.com/docs/installation',
  },
  win32: {
    chocolatey: 'choco install anchor',
    scoop: 'scoop install anchor',
    manual: 'https://www.anchor-lang.com/docs/installation',
    instructions: 'https://www.anchor-lang.com/docs/installation',
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

function checkCargoAvailable() {
  try {
    execSync('which cargo', { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync('where cargo', { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
}

function checkCurlAvailable() {
  try {
    execSync('which curl', { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync('where curl', { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
}

function checkCCompilerAvailable() {
  try {
    execSync('which cc', { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync('which gcc', { stdio: 'ignore' })
      return true
    } catch {
      try {
        execSync('where cc', { stdio: 'ignore' })
        return true
      } catch {
        try {
          execSync('where gcc', { stdio: 'ignore' })
          return true
        } catch {
          return false
        }
      }
    }
  }
}

function checkAptAvailable() {
  try {
    execSync('which apt-get', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function checkYumAvailable() {
  try {
    execSync('which yum', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function checkDnfAvailable() {
  try {
    execSync('which dnf', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function installBuildTools() {
  const os = getPlatform()
  if (os !== 'linux') {
    return true // Not needed on macOS/Windows
  }

  if (checkCCompilerAvailable()) {
    return true // Already installed
  }

  console.log('\n📦 C compiler (gcc/cc) is required for Rust compilation')

  // Try apt-get (Debian/Ubuntu)
  if (checkAptAvailable()) {
    try {
      console.log('   Installing build-essential via apt-get...')
      execSync('sudo apt-get update && sudo apt-get install -y build-essential', {
        stdio: 'inherit',
      })
      if (checkCCompilerAvailable()) {
        console.log('✅ Build tools installed successfully')
        return true
      }
    } catch (error) {
      console.error(`\n⚠️  apt-get installation failed: ${error.message}`)
      console.error('   You may need to run: sudo apt-get install -y build-essential')
    }
  }

  // Try dnf (Fedora/RHEL 8+)
  if (checkDnfAvailable()) {
    try {
      console.log('   Installing gcc via dnf...')
      execSync('sudo dnf install -y gcc', {
        stdio: 'inherit',
      })
      if (checkCCompilerAvailable()) {
        console.log('✅ Build tools installed successfully')
        return true
      }
    } catch (error) {
      console.error(`\n⚠️  dnf installation failed: ${error.message}`)
      console.error('   You may need to run: sudo dnf install -y gcc')
    }
  }

  // Try yum (RHEL/CentOS 7)
  if (checkYumAvailable()) {
    try {
      console.log('   Installing gcc via yum...')
      execSync('sudo yum install -y gcc', {
        stdio: 'inherit',
      })
      if (checkCCompilerAvailable()) {
        console.log('✅ Build tools installed successfully')
        return true
      }
    } catch (error) {
      console.error(`\n⚠️  yum installation failed: ${error.message}`)
      console.error('   You may need to run: sudo yum install -y gcc')
    }
  }

  console.error('\n⚠️  Could not automatically install build tools')
  console.error('   Please install a C compiler manually:')
  console.error('   - Debian/Ubuntu: sudo apt-get install -y build-essential')
  console.error('   - Fedora/RHEL: sudo dnf install -y gcc')
  console.error('   - CentOS/RHEL 7: sudo yum install -y gcc')
  return false
}

function installRust() {
  if (!checkCurlAvailable()) {
    console.error('\n⚠️  curl is required to install Rust')
    console.error('   Please install curl first, then run this script again')
    return false
  }

  // Check and install build tools before installing Rust
  if (!installBuildTools()) {
    console.error('\n⚠️  Build tools are required to install Rust')
    return false
  }

  try {
    console.log('\n📦 Installing Rust/Cargo (required for Anchor)...')
    console.log(
      '   Running: curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y',
    )
    execSync('curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y', {
      stdio: 'inherit',
    })

    // Update PATH to include cargo bin directory
    const cargoBinPath = process.env.HOME
      ? `${process.env.HOME}/.cargo/bin`
      : `${process.env.USERPROFILE}/.cargo/bin`

    process.env.PATH = `${cargoBinPath}:${process.env.PATH}`

    // Verify cargo is now available
    try {
      const cargoPath = `${cargoBinPath}/cargo`
      execSync(`"${cargoPath}" --version`, { stdio: 'ignore' })
      console.log('✅ Rust/Cargo installed successfully')
      return true
    } catch {
      // Try checking if cargo is in PATH now
      try {
        execSync('cargo --version', {
          stdio: 'ignore',
          env: { ...process.env, PATH: process.env.PATH },
        })
        console.log('✅ Rust/Cargo installed successfully')
        return true
      } catch {
        // Installation completed but cargo not immediately available
        console.log('✅ Rust installation completed')
        console.log('\n⚠️  Note: Cargo may not be available in this session.')
        console.log('   Please restart your terminal or run:')
        const cargoEnv = process.env.HOME
          ? `${process.env.HOME}/.cargo/env`
          : `${process.env.USERPROFILE}/.cargo/env`
        console.log(`   source "${cargoEnv}"`)
        console.log('   Then verify with: cargo --version')
        return true
      }
    }
  } catch (error) {
    console.error(`\n⚠️  Rust installation failed: ${error.message}`)
    return false
  }
}

function installTool() {
  const os = getPlatform()
  const instructions = TOOL[os]
  const displayName = TOOL.name

  if (!instructions) {
    console.error(`\n⚠️  Cannot install ${displayName} on ${os}`)
    console.error(
      `Please install ${displayName} manually: ${instructions?.instructions || 'See documentation'}`,
    )
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

  // Anchor: Use avm (requires cargo for Linux)
  if (instructions.manual) {
    if (os === 'linux' && !checkCargoAvailable()) {
      console.log(`\n📦 Rust/Cargo is required to install Anchor on Linux`)
      const rustInstalled = installRust()
      if (!rustInstalled) {
        console.error(`\n⚠️  Failed to install Rust/Cargo`)
        console.error(
          `   Please install Rust manually: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`,
        )
        console.error(
          `   Then run this script again or install Anchor manually: ${instructions.manual}`,
        )
        return false
      }
      // Verify cargo is now available before proceeding
      if (!checkCargoAvailable()) {
        console.error(`\n⚠️  Rust was installed but cargo is not available in this session`)
        console.error(`   Please restart your terminal and run this script again`)
        console.error(`   Or install Anchor manually: ${instructions.manual}`)
        return false
      }
    }

    try {
      console.log(`\n📦 Installing ${displayName} via avm...`)

      // Check if avm is already installed
      let avmInstalled = false
      try {
        execSync('avm --version', { stdio: 'ignore' })
        avmInstalled = true
      } catch {
        // avm not installed, need to install it first (Linux only)
        if (os === 'linux') {
          // Ensure build tools are available before installing avm
          if (!checkCCompilerAvailable()) {
            console.log(`   C compiler required for avm installation...`)
            if (!installBuildTools()) {
              console.error(`\n⚠️  Build tools are required to install avm`)
              throw new Error('Build tools not available')
            }
          }

          console.log(`   Installing avm...`)
          // Use cargo from PATH (which should include ~/.cargo/bin if Rust was just installed)
          const avmInstallCmd = instructions.manual.split(' && ')[0]
          execSync(avmInstallCmd, {
            stdio: 'inherit',
            env: { ...process.env },
          })
          avmInstalled = true
        }
      }

      if (os === 'macos' && !avmInstalled) {
        // Try installing avm via cargo if Homebrew is not available
        if (!checkBrewAvailable() && checkCargoAvailable()) {
          try {
            console.log(`   Installing avm via cargo...`)
            execSync(
              'cargo install --git https://github.com/coral-xyz/anchor avm --locked --force',
              {
                stdio: 'inherit',
                env: { ...process.env },
              },
            )
            // Verify avm is now installed
            try {
              execSync('avm --version', { stdio: 'ignore' })
              avmInstalled = true
            } catch {
              // avm may not be in PATH yet, but installation might have succeeded
              console.log('   avm installation completed, but may not be in PATH')
              console.log('   Please restart your terminal or add ~/.cargo/bin to PATH')
            }
          } catch (error) {
            console.error(`\n⚠️  Failed to install avm via cargo: ${error.message}`)
          }
        }

        if (!avmInstalled) {
          console.error(`\n⚠️  avm is required to install Anchor on macOS but is not installed`)
          if (checkBrewAvailable()) {
            console.error(`   Please install avm via Homebrew: ${instructions.brew}`)
          } else if (checkCargoAvailable()) {
            console.error(
              `   Please install avm manually: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`,
            )
          } else {
            console.error(`   Please install avm first or use Homebrew: ${instructions.brew}`)
            console.error(
              `   Or install Rust/Cargo first, then: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`,
            )
          }
          return false
        }
      }

      if (avmInstalled) {
        // Install and use latest Anchor
        console.log(`   Installing latest Anchor version...`)
        execSync('avm install latest', { stdio: 'inherit' })
        execSync('avm use latest', { stdio: 'inherit' })

        if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
          console.log(`✅ ${displayName} installed successfully`)
          return true
        }
      }
    } catch (error) {
      const errorMessage = error.message || String(error)
      console.error(`\n⚠️  avm installation failed: ${errorMessage}`)

      // Check if it's a linker/compiler error
      if (
        errorMessage.includes('linker') ||
        errorMessage.includes('cc') ||
        errorMessage.includes('gcc')
      ) {
        console.error('\n💡 This error usually means a C compiler is missing.')
        if (os === 'linux') {
          console.error('   The script attempted to install build tools, but it may have failed.')
          console.error('   Please install manually:')
          console.error('   - Debian/Ubuntu: sudo apt-get install -y build-essential')
          console.error('   - Fedora/RHEL: sudo dnf install -y gcc')
          console.error('   - CentOS/RHEL 7: sudo yum install -y gcc')
          console.error('   Then run this script again.')
        }
      }
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
  console.log('\n🔨 Setting up Solana contract development tools (Anchor)...\n')

  const isRequired = TOOL.required
  const displayName = TOOL.name

  if (checkToolExists(TOOL.command, TOOL.checkCommand)) {
    try {
      const version = execSync(TOOL.checkCommand, { encoding: 'utf-8' }).trim()
      console.log(`✅ ${displayName} is already installed (${version})`)
    } catch {
      console.log(`✅ ${displayName} is already installed`)
    }
    console.log('\n✅ Solana tools setup complete!\n')
    exit(0)
  }

  console.log(`📥 ${displayName} is not installed${isRequired ? ' (required)' : ' (optional)'}`)

  const installed = installTool()

  if (installed) {
    console.log('\n✅ Solana tools setup complete!\n')
    exit(0)
  } else {
    if (isRequired) {
      console.error(`\n❌ ${displayName} is required but installation failed`)
      console.error('Please install Anchor manually and try again.\n')
      exit(1)
    } else {
      console.log(`\n⚠️  ${displayName} installation skipped (optional)`)
      console.log('   Solana contracts will skip building if Anchor is not available')
      console.log('\n✅ Solana tools setup complete!\n')
      exit(0)
    }
  }
}

main()
