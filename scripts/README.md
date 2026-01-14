# Scripts

Utility scripts for this monorepo.

## Documentation

For comprehensive guides, see:

- **[Publishing Guide](https://basilic-docs.vercel.app/docs/guides/publishing)** - Complete guide to publishing packages
- **[Security Guide](https://basilic-docs.vercel.app/docs/guides/security)** - Security baseline and secret scanning
- **[Deployment Guide](https://basilic-docs.vercel.app/docs/guides/deployment)** - Deployment options and strategies

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

**Package Configuration**: Packages using these scripts should have development exports pointing to `src/` in `package.json`. See [Publishing Guide](https://basilic-docs.vercel.app/docs/guides/publishing) for complete configuration details.

## Security Scripts

Scripts that prevent committing secrets and scan for vulnerabilities.

### `block-secret-files.mjs`

Prevents committing sensitive file types in pre-commit hooks.

**What gets blocked**:
- `.env` (but `.env-example`, `.env.schema`, `.env.*` variants are allowed)
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
pnpm secrets:scan:staged
```

### `ensure-tool.mjs`

Checks tool availability and prints install instructions if missing.

**Usage**: Used internally by other scripts to verify required tools are installed.

## Notes

- Publishing scripts use `process.cwd()` to find the package's `package.json` (they run from within each package directory)
- If `.package-originals.json` doesn't exist, `restore-publish.mjs` exits gracefully (useful for first-time runs)
- Publishing scripts are only needed for packages that will be published to npm
- Private workspace-only packages don't need publishing scripts
- Security scripts run from the repository root and work with the monorepo structure
