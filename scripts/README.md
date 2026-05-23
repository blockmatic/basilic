# Scripts

Utility scripts for this monorepo.

## QA Pipeline

### `run-qa.mjs`

Runs the full QA pipeline sequentially: install, checktypes, lint:fix, build, test, test:e2e. Stops immediately on the first failure and prints a clear error banner.

**Usage**: Via pnpm at repository root:
```bash
pnpm qa
# or
node scripts/run-qa.mjs
```

## Documentation

For comprehensive guides, see:

- **[Publishing Guide](@apps/docu/content/docs/deployment/publishing.mdx)** - Complete guide to publishing packages
- **[Security Guide](@apps/docu/content/docs/security/index.mdx)** - Security baseline and secret scanning
- **[Deployment Guide](@apps/docu/content/docs/deployment/index.mdx)** - Deployment options and strategies

## Publishing Scripts

Scripts that handle dual-mode export configuration for npm publishing.

### `prepare-publish.mjs`

Runs during `prepack` lifecycle hook (before `pnpm pack` or `pnpm publish`):

1. Stores original `package.json` exports/main/types in `.package-originals.json`
2. Switches `exports`, `main`, and `types` to point to `dist/`
3. Sets `files: ["dist"]` to ensure only built files are included

**Note**: `pnpm build` runs first via the prepack script before this script executes.

### `restore-publish.mjs`

Runs during `postpack` lifecycle hook (after packing):

1. Reads stored originals from `.package-originals.json`
2. Restores original `package.json` configuration
3. Removes temporary `.package-originals.json` file

**Usage**: Automatically invoked via npm/pnpm lifecycle hooks. No manual execution needed.

**Package Configuration**: Packages using these scripts should have development exports pointing to `src/` in `package.json`. See [Publishing Guide](@apps/docu/content/docs/deployment/publishing.mdx) for complete configuration details.

## Security Scripts

Scripts that prevent committing secrets, scan for vulnerabilities, and install security tools.

### Security Script Organization

All security-related pnpm scripts are organized under the `security:` namespace:

- **`pnpm security:block-files`** - Check for blocked secret file types
- **`pnpm security:secrets`** - Scan staged files for secrets (gitleaks)
- **`pnpm security:secrets:full`** - Full repository secret scan (gitleaks)
- **`pnpm security:osv`** - Scan dependencies for vulnerabilities (OSV Scanner)
- **`pnpm security:audit`** - Run pnpm audit for dependency vulnerabilities
- **`pnpm security:check`** - Run all security checks (comprehensive)
- **`pnpm setup:deepsec`** - Scaffold `.deepsec/` workspace (one-time; also runs in `pnpm setup`)
- **`pnpm security:deepsec`** - Agentic PR review via deepsec (`process --diff origin/main`)
- **`pnpm security:deepsec:full`** - Full-repo deepsec scan + process (optional `DEEPSEC_LIMIT`)

### `block-secret-files.mjs`

Prevents committing sensitive file types in pre-commit hooks.

**What gets blocked**:
- `.env` and related sensitive paths (see `block-secret-files.mjs`); allowed committed templates — `.env.<qualifier>.example`, `.env.schema`, `.env.{development,staging,production,test}` — use the same patterns in `.trufflehogignore` for TruffleHog
- `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `*.keystore`
- `id_rsa*` (SSH private keys)
- Certificate files: `*.crt`, `*.cer`, `*.der`, `*.p7b`, `*.p7c`, `*.p7m`, `*.p7s`
- `*.keytab`

**Usage**: Automatically runs in pre-commit hooks via `simple-git-hooks`.

### `scan-secrets-staged.mjs`

Wrapper script for gitleaks staged file scanning.

**What it scans**:
- Cryptocurrency private keys (Ethereum, Solana, Cosmos, etc.)
- Mnemonic phrases and seed phrases
- API keys and secrets
- JWT secrets
- Database passwords
- AWS credentials

**Usage**: Automatically runs in pre-commit hooks. Can be run manually:
```bash
pnpm security:secrets
```

### `scan-osv.mjs`

Wrapper script for OSV Scanner vulnerability scanning.

**What it scans**:
- Dependencies in `pnpm-lock.yaml` for known vulnerabilities
- Checks against OSV (Open Source Vulnerabilities) database

**Usage**: Automatically runs in pre-commit hooks via `hooks:security`. Can be run manually:
```bash
pnpm security:osv
# or
node scripts/scan-osv.mjs
```

**Note**: Requires osv-scanner to be installed. If not installed, the script will skip gracefully with a warning.

### `ensure-tool.mjs`

Checks tool availability and prints install instructions if missing.

**Usage**: Used internally by other scripts to verify required tools are installed.

### `setup-gitleaks.mjs`

Installs gitleaks for secret scanning in git repositories.

**What it installs**:
- **gitleaks** (required): Secret scanning tool that detects hardcoded secrets, API keys, passwords, and other sensitive information

**Installation methods**:
- **macOS**: Uses Homebrew if available, otherwise downloads binary from GitHub releases
- **Linux**: Downloads binary from GitHub releases
- **Windows**: Prints installation instructions (Chocolatey, Scoop, or manual)

**Usage**: Automatically runs during `pnpm setup`. Can be run manually:
```bash
pnpm setup:gitleaks
# or
node scripts/setup-gitleaks.mjs
```

**Note**: gitleaks is required. Pre-commit hooks will fail if gitleaks is not installed.

### `setup-deepsec.mjs`

Scaffolds the `.deepsec/` workspace (runs `deepsec init` once) and installs dependencies inside it.

**Usage**: Automatically runs during `pnpm setup`. Can be run manually:
```bash
pnpm setup:deepsec
# or
node scripts/setup-deepsec.mjs
```

**Note**: Optional on failure — setup continues. Configure `.deepsec/.env.local` and `data/basilic/INFO.md` before running `pnpm security:deepsec`.

### `setup-osv-scanner.mjs`

Installs osv-scanner for vulnerability scanning in dependencies.

**What it installs**:
- **osv-scanner** (optional): Vulnerability scanner that checks dependencies against OSV database

**Installation methods**:
- **macOS**: Uses Homebrew if available, otherwise downloads binary from GitHub releases
- **Linux**: Downloads binary from GitHub releases
- **Windows**: Prints installation instructions (Chocolatey, Scoop, or manual)

**Usage**: Automatically runs during `pnpm setup`. Can be run manually:
```bash
pnpm setup:osv
# or
node scripts/setup-osv-scanner.mjs
```

**Note**: osv-scanner is optional. Used for scanning dependencies with `pnpm security:osv`.

### `setup-security-tools.mjs`

Installs all security tools (gitleaks and osv-scanner).

**Usage**: Automatically runs during `pnpm setup`. Can be run manually:
```bash
pnpm setup:security
# or
node scripts/setup-security-tools.mjs
```

### `security-check.mjs`

Comprehensive security check script that runs all security scans.

**What it checks**:
1. Blocked secret files (via `block-secret-files.mjs`)
2. Secrets in repository (via gitleaks)
3. Dependency vulnerabilities (via osv-scanner)
4. pnpm audit for high+ severity vulnerabilities

**Usage**: Run manually to perform all security checks:
```bash
pnpm security:check
# or
node scripts/security-check.mjs
```

**Note**: Scripts will skip gracefully if tools are not installed, but will report warnings.

### `run-deepsec.mjs`

Wrapper for [deepsec](https://github.com/vercel-labs/deepsec) agentic code review. Requires a `.deepsec/` workspace and AI credentials in `.deepsec/.env.local` or the environment.

**Modes**:
- `pr` — `deepsec process --diff origin/main` (default via `pnpm security:deepsec`)
- `full` — `deepsec scan` then `deepsec process` (`pnpm security:deepsec:full`; honors `DEEPSEC_LIMIT`)

**Usage**:
```bash
pnpm setup:deepsec   # once (or via pnpm setup)
# configure .deepsec/.env.local, fill data/basilic/INFO.md
pnpm security:deepsec
DEEPSEC_LIMIT=50 pnpm security:deepsec:full
```

Not part of pre-commit, `security:check`, `pnpm qa`, or CI.

## Database Development Scripts

Scripts that install database development tools for PostgreSQL with Supabase.

### `setup-database.mjs`

Installs Docker, Docker Compose, and Supabase CLI for local PostgreSQL development and database management.

**What it installs**:
- **Docker** (required): Container runtime required by Supabase CLI for local development
- **Docker Compose** (required): Included with Docker, used by Supabase CLI for orchestrating services
- **Supabase CLI** (optional): Command-line tool for local PostgreSQL development, migrations, and Supabase project management

**Installation methods**:
- **macOS**: 
  - Docker: Installs Docker Desktop via Homebrew (`brew install --cask docker`)
  - Docker Compose: Included with Docker Desktop
  - Supabase CLI: Uses Homebrew if available (`brew install supabase/tap/supabase`)
- **Linux**: 
  - Docker: Installs Docker Engine via official Docker repository (Debian/Ubuntu)
  - Docker Compose: Included as plugin with Docker Engine
  - Supabase CLI: Downloads `.deb` package from GitHub releases and installs with `dpkg`
- **Windows**: Prints installation instructions (Chocolatey, Scoop, or manual)

**Usage**: Can be run manually:
```bash
pnpm setup:database
# or
node scripts/setup-database.mjs
```

**Note**: Docker and Docker Compose are required for Supabase CLI to function. Supabase CLI is optional. Used for local PostgreSQL development with Supabase. Database features will skip if Supabase CLI is not available.

After Supabase is running, a full local wipe + migrations + data seed is **`pnpm reset`** from the repository root (`pnpm --filter @repo/api reset`). See `apps/api/README.md`.

## Notes

- Publishing scripts use `process.cwd()` to find the package's `package.json` (they run from within each package directory)
- If `.package-originals.json` doesn't exist, `restore-publish.mjs` exits gracefully (useful for first-time runs)
- Publishing scripts are only needed for packages that will be published to npm
- Private workspace-only packages don't need publishing scripts
- Security scripts run from the repository root and work with the monorepo structure
