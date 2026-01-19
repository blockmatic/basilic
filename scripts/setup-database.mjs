#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { exit } from 'node:process'

const DOCKER = {
  name: 'Docker',
  command: 'docker',
  checkCommand: 'docker --version',
  required: true,
  macos: {
    brew: 'brew install --cask docker',
    manual: 'https://docs.docker.com/desktop/install/mac-install/',
  },
  linux: {
    manual: 'https://docs.docker.com/engine/install/',
  },
  win32: {
    chocolatey: 'choco install docker-desktop',
    scoop: 'scoop install docker',
    manual: 'https://docs.docker.com/desktop/install/windows-install/',
  },
}

const DOCKER_COMPOSE = {
  name: 'Docker Compose',
  command: 'docker',
  checkCommand: 'docker compose version',
  required: true,
  macos: {
    // Included with Docker Desktop
    manual: 'https://docs.docker.com/compose/install/',
  },
  linux: {
    // Included with Docker Engine
    manual: 'https://docs.docker.com/compose/install/',
  },
  win32: {
    // Included with Docker Desktop
    manual: 'https://docs.docker.com/compose/install/',
  },
}

const SUPABASE = {
  name: 'Supabase CLI',
  command: 'supabase',
  checkCommand: 'supabase --version',
  required: false,
  repo: 'supabase/cli',
  macos: {
    brew: 'brew install supabase/tap/supabase',
    manual: 'https://supabase.com/docs/guides/cli/getting-started',
  },
  linux: {
    getDownloadUrl: version => {
      // Remove 'v' prefix if present and construct URL
      const versionNumber = version.replace(/^v/, '')
      return `https://github.com/supabase/cli/releases/download/v${versionNumber}/supabase_${versionNumber}_linux_amd64.deb`
    },
    manual: 'https://supabase.com/docs/guides/cli/getting-started',
  },
  win32: {
    chocolatey: 'choco install supabase',
    scoop: 'scoop install supabase',
    manual: 'https://supabase.com/docs/guides/cli/getting-started',
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

function checkDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' })
    return true
  } catch {
    return false
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

function checkWgetAvailable() {
  try {
    execSync('which wget', { stdio: 'ignore' })
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

function installDocker() {
  const os = getPlatform()
  const instructions = DOCKER[os]
  const displayName = DOCKER.name

  if (!instructions) {
    console.error(`\n⚠️  Cannot install ${displayName} on ${os}`)
    console.error(
      `Please install ${displayName} manually: ${instructions?.manual || 'https://docs.docker.com/get-docker/'}`,
    )
    return false
  }

  // macOS: Install Docker Desktop via Homebrew
  if (os === 'macos' && instructions.brew && checkBrewAvailable()) {
    try {
      console.log(`\n📦 Installing ${displayName} Desktop via Homebrew...`)
      execSync(instructions.brew, { stdio: 'inherit' })
      console.log(`\n✅ ${displayName} Desktop installed successfully`)
      console.log(
        `\n⚠️  Please start Docker Desktop from Applications and ensure it's running before continuing.`,
      )
      return true
    } catch (error) {
      console.error(`\n⚠️  Homebrew installation failed: ${error.message}`)
      console.error(`Please install manually: ${instructions.manual}`)
      return false
    }
  }

  // Linux: Install Docker Engine via official repository
  if (os === 'linux') {
    try {
      console.log(`\n📦 Installing ${displayName} Engine...`)
      console.log(`   Setting up Docker's official APT repository...`)

      // Detect distribution
      let distro = 'debian'
      let codename = 'bookworm'
      try {
        const osRelease = execSync('cat /etc/os-release', { encoding: 'utf-8' })
        if (osRelease.includes('Ubuntu')) {
          distro = 'ubuntu'
          const match = osRelease.match(/UBUNTU_CODENAME=(\w+)/)
          if (match) codename = match[1]
          else {
            const versionMatch = osRelease.match(/VERSION_ID="?(\d+\.\d+)/)
            if (versionMatch) {
              const version = parseFloat(versionMatch[1])
              if (version >= 24.04) codename = 'noble'
              else if (version >= 22.04) codename = 'jammy'
              else if (version >= 20.04) codename = 'focal'
            }
          }
        } else {
          const match = osRelease.match(/VERSION_CODENAME=(\w+)/)
          if (match) codename = match[1]
        }
      } catch {
        // Use defaults
      }

      // Install prerequisites
      execSync('sudo apt-get update', { stdio: 'inherit' })
      execSync('sudo apt-get install -y ca-certificates curl gnupg lsb-release', {
        stdio: 'inherit',
      })

      // Add Docker's official GPG key
      execSync('sudo install -m 0755 -d /etc/apt/keyrings', { stdio: 'ignore' })
      execSync(
        `sudo curl -fsSL https://download.docker.com/linux/${distro}/gpg -o /etc/apt/keyrings/docker.asc`,
        { stdio: 'inherit' },
      )
      execSync('sudo chmod a+r /etc/apt/keyrings/docker.asc', { stdio: 'ignore' })

      // Add Docker repository
      const arch = execSync('dpkg --print-architecture', { encoding: 'utf-8' }).trim()
      const repoLine = `deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${distro} ${codename} stable`
      execSync(`echo "${repoLine}" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`, {
        stdio: 'ignore',
      })

      // Install Docker Engine and Compose plugin
      execSync('sudo apt-get update', { stdio: 'inherit' })
      execSync(
        'sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
        { stdio: 'inherit' },
      )

      // Start and enable Docker service
      execSync('sudo systemctl enable docker', { stdio: 'ignore' })
      execSync('sudo systemctl start docker', { stdio: 'inherit' })

      // Add current user to docker group (if not already)
      try {
        execSync('sudo groupadd docker', { stdio: 'ignore' })
      } catch {
        // Group already exists, ignore
      }
      execSync(`sudo usermod -aG docker ${process.env.USER || 'root'}`, {
        stdio: 'ignore',
      })

      console.log(`\n✅ ${displayName} Engine installed successfully`)
      console.log(
        `\n⚠️  Note: You may need to logout and login again for group changes to take effect.`,
      )
      console.log(`   Or run: newgrp docker`)

      // Verify Docker is running
      if (checkDockerRunning()) {
        console.log(`✅ Docker daemon is running`)
        return true
      } else {
        console.log(`\n⚠️  Docker is installed but daemon may not be running.`)
        console.log(`   Try: sudo systemctl start docker`)
        return true // Still consider it installed
      }
    } catch (error) {
      console.error(`\n❌ Failed to install ${displayName}`)
      if (error.message) {
        console.error(`Error: ${error.message}`)
      }
      console.error(`\nPlease install manually: ${instructions.manual}`)
      return false
    }
  }

  // Windows: Print instructions
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

function checkDockerCompose() {
  const os = getPlatform()
  const instructions = DOCKER_COMPOSE[os]
  const displayName = DOCKER_COMPOSE.name

  // Docker Compose is included with Docker Desktop (macOS/Windows) and Docker Engine (Linux)
  // Just verify it's available
  if (checkToolExists('docker', 'docker compose version')) {
    try {
      const version = execSync('docker compose version', { encoding: 'utf-8' }).trim()
      console.log(`✅ ${displayName} is available (${version})`)
      return true
    } catch {
      console.log(`✅ ${displayName} is available`)
      return true
    }
  }

  console.error(`\n⚠️  ${displayName} is not available.`)
  console.error(`   ${displayName} should be included with Docker installation.`)
  if (instructions.manual) {
    console.error(`   See: ${instructions.manual}`)
  }
  return false
}

function installSupabase() {
  const os = getPlatform()
  const instructions = SUPABASE[os]
  const displayName = SUPABASE.name

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
      if (checkToolExists(SUPABASE.command, SUPABASE.checkCommand)) {
        console.log(`✅ ${displayName} installed successfully`)
        return true
      }
    } catch (error) {
      console.error(`\n⚠️  Homebrew installation failed: ${error.message}`)
      console.error(`Please install manually: ${instructions.manual}`)
      return false
    }
  }

  // Linux: Install .deb package
  if (os === 'linux' && instructions.getDownloadUrl) {
    try {
      // Get latest version
      const version = getLatestVersion(SUPABASE.repo)
      if (!version) {
        console.error(`\n❌ Failed to get latest version for ${displayName}`)
        if (instructions.manual) {
          console.error(`Please install manually: ${instructions.manual}`)
        }
        return false
      }

      const downloadUrl = instructions.getDownloadUrl(version)
      const debFile = '/tmp/supabase_linux_amd64.deb'

      // Check for wget or curl
      if (!checkWgetAvailable() && !checkCurlAvailable()) {
        console.error('\n❌ Neither wget nor curl is available. Please install one of them.')
        if (instructions.manual) {
          console.error(`Please install manually: ${instructions.manual}`)
        }
        return false
      }

      console.log(`\n📦 Installing ${displayName} (version ${version})...`)
      console.log(`   Downloading from: ${downloadUrl}`)

      // Download .deb file
      let downloadCommand
      if (checkWgetAvailable()) {
        downloadCommand = `wget -O ${debFile} "${downloadUrl}"`
      } else {
        downloadCommand = `curl -L -o ${debFile} "${downloadUrl}"`
      }
      execSync(downloadCommand, { stdio: 'inherit' })

      // Install .deb package
      console.log(`   Installing package...`)
      execSync(`sudo dpkg -i ${debFile}`, { stdio: 'inherit' })

      // Clean up .deb file
      try {
        execSync(`rm ${debFile}`, { stdio: 'ignore' })
      } catch {
        // Ignore cleanup errors
      }

      // Verify installation
      if (checkToolExists(SUPABASE.command, SUPABASE.checkCommand)) {
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

  // Fallback: Print manual instructions
  if (instructions.manual) {
    console.error(`\n⚠️  Automatic installation failed. Please install manually:`)
    console.error(`   ${instructions.manual}`)
  }

  return false
}

function main() {
  console.log('\n🗄️  Setting up database development tools...\n')
  console.log('This will install Docker, Docker Compose, and Supabase CLI.\n')

  let hasErrors = false

  // Step 1: Check/Install Docker
  console.log('📦 Step 1/3: Checking Docker...')
  if (checkToolExists(DOCKER.command, DOCKER.checkCommand)) {
    try {
      const version = execSync(DOCKER.checkCommand, { encoding: 'utf-8' }).trim()
      console.log(`✅ Docker is already installed (${version})`)
    } catch {
      console.log(`✅ Docker is already installed`)
    }

    // Check if Docker daemon is running
    if (checkDockerRunning()) {
      console.log(`✅ Docker daemon is running`)
    } else {
      console.log(`\n⚠️  Docker is installed but daemon is not running.`)
      const os = getPlatform()
      if (os === 'linux') {
        console.log(`   Please start it with: sudo systemctl start docker`)
      } else if (os === 'macos') {
        console.log(`   Please start Docker Desktop from Applications`)
      }
      console.log(`   Supabase CLI requires Docker to be running.\n`)
    }
  } else {
    console.log(`📥 Docker is not installed (required)`)
    const installed = installDocker()
    if (!installed) {
      console.error(`\n❌ Docker is required but installation failed`)
      console.error('Please install Docker manually and try again.\n')
      exit(1)
    }
  }

  // Step 2: Check Docker Compose
  console.log('\n📦 Step 2/3: Checking Docker Compose...')
  if (!checkDockerCompose()) {
    console.error(`\n❌ Docker Compose is required but not available`)
    console.error('Docker Compose should be included with Docker installation.')
    hasErrors = true
  }

  // Step 3: Check/Install Supabase CLI
  console.log('\n📦 Step 3/3: Checking Supabase CLI...')
  if (checkToolExists(SUPABASE.command, SUPABASE.checkCommand)) {
    try {
      const version = execSync(SUPABASE.checkCommand, { encoding: 'utf-8' }).trim()
      console.log(`✅ Supabase CLI is already installed (${version})`)
    } catch {
      console.log(`✅ Supabase CLI is already installed`)
    }
  } else {
    console.log(
      `📥 Supabase CLI is not installed${SUPABASE.required ? ' (required)' : ' (optional)'}`,
    )
    const installed = installSupabase()
    if (!installed) {
      if (SUPABASE.required) {
        console.error(`\n❌ Supabase CLI is required but installation failed`)
        console.error('Please install Supabase CLI manually and try again.\n')
        exit(1)
      } else {
        console.log(`\n⚠️  Supabase CLI installation skipped (optional)`)
        console.log('   Database features will skip if Supabase CLI is not available')
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ Database tools setup incomplete')
    exit(1)
  }

  console.log('\n✅ Database tools setup complete!\n')
  exit(0)
}

main()
