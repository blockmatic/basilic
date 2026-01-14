# Security Baseline

This repository implements a comprehensive security baseline to prevent committing secrets and to scan for vulnerabilities. All tools used are free and open source.

## Overview

The security baseline consists of:

1. **Pre-commit hooks** - Run locally before each commit
2. **CI workflows** - Run on every pull request and push to main

## Pre-commit Hooks

Pre-commit hooks run automatically via `simple-git-hooks` when you attempt to commit. They perform:

1. **File blocking** - Prevents committing sensitive file types (`.env`, `*.pem`, `*.key`, etc.)
2. **Secret scanning** - Scans staged files for secrets using gitleaks

### What Gets Blocked

The following file patterns are blocked from being committed:

- `.env` (but `.env-example`, `.env.schema`, `.env.development`, `.env.staging`, `.env.production`, `.env.test` are allowed)
- `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `*.keystore`
- `id_rsa*` (SSH private keys)
- Certificate files: `*.crt`, `*.cer`, `*.der`, `*.p7b`, `*.p7c`, `*.p7m`, `*.p7s`
- `*.keytab`

### Secret Scanning

If gitleaks is installed, staged files are scanned for:

- Cryptocurrency private keys (Ethereum, Solana, Cosmos, etc.)
- Mnemonic phrases and seed phrases
- API keys and secrets
- JWT secrets
- Database passwords
- AWS credentials

## Required Tools

Install all required security tools automatically:

```bash
pnpm run setup
```

This command will:
1. Install project dependencies
2. Set up git hooks
3. Install and configure security tools (gitleaks, osv-scanner)

**Manual installation:** If you prefer to install tools manually, see:
- [gitleaks installation](https://github.com/gitleaks/gitleaks#installation)
- [osv-scanner installation](https://google.github.io/osv-scanner/installation/)
- [trufflehog installation](https://github.com/trufflesecurity/trufflehog#installation)

## Manual Scanning

You can run security scans manually:

```bash
# Scan staged files for secrets
pnpm run secrets:scan:staged

# Scan entire repository for secrets
pnpm run secrets:scan

# Scan dependencies for vulnerabilities (OSV)
pnpm run deps:osv

# Run pnpm audit
pnpm run deps:audit
```

## CI Workflow

The `.github/workflows/security.yml` workflow runs on every pull request and push to main. It performs:

1. **Lockfile integrity check** - Uses `--frozen-lockfile` to ensure dependencies match lockfile
2. **Full repository secret scan** - Scans entire repo with gitleaks
3. **TruffleHog scan** - Scans filesystem and git history
4. **Dependency vulnerability scan** - Uses OSV Scanner on `pnpm-lock.yaml`
5. **pnpm audit** - Checks for known vulnerabilities in dependencies

All checks must pass for CI to succeed.

## What to Do If Secrets Are Detected

### 1. Rotate the Secret Immediately

If a secret is detected in your commit:

1. **Rotate the secret immediately** - Change the API key, private key, or password
2. **Do not commit the fix** - The secret is already exposed in git history
3. **Clean git history** - See below

### 2. Clean Git History

If a secret was committed:

**Option A: If not yet pushed**
```bash
# Remove the secret from the commit
git reset HEAD~1
# Edit the file to remove the secret
# Commit again
```

**Option B: If already pushed (requires force push)**
```bash
# Use git-filter-repo or BFG Repo-Cleaner to remove secrets from history
# WARNING: This rewrites git history and requires force push
# Only do this if you have permission and coordinate with your team
```

**Option C: Add to allowlist (only for false positives)**
- If the detection is a false positive (e.g., test data), add it to `.gitleaks.toml` allowlist
- Never add real secrets to the allowlist

### 3. Prevent Future Incidents

- Use `.env` files for secrets (never commit them)
- Use `.env-example` or `.env.schema` for templates
- Review staged files before committing: `git diff --cached`
- Run `pnpm run secrets:scan:staged` before committing

## Adding Allowlist Entries

If you have a legitimate false positive (e.g., test fixtures, example data), you can add it to `.gitleaks.toml`:

### Allowlist a File Path

```toml
[allowlist]
paths = [
  '''test/fixtures/.*''',
  '''examples/.*''',
]
```

### Allowlist a Regex Pattern

```toml
[allowlist]
regexes = [
  '''test.*private.*key''',
  '''example.*secret''',
]
```

**Important:** Only add entries for obvious test/example data. Never allowlist real secrets.

## Configuration Files

- **`.gitleaks.toml`** - Gitleaks configuration with crypto-focused rules and allowlist
- **`scripts/block-secret-files.mjs`** - Pre-commit script that blocks sensitive file types
- **`scripts/ensure-tool.mjs`** - Checks tool availability and prints install instructions
- **`.github/workflows/security.yml`** - CI workflow for security checks

## Troubleshooting

### Pre-commit hook not running

Ensure simple-git-hooks is installed:
```bash
pnpm install
pnpm simple-git-hooks
```

### gitleaks not found

The pre-commit hook will show install instructions if gitleaks is missing. Install it using the instructions above.

### False positives

If you get false positives:
1. Verify it's actually a false positive (not a real secret)
2. Add to `.gitleaks.toml` allowlist if appropriate
3. Use specific patterns to avoid allowing real secrets

### CI failing on secrets

If CI detects secrets:
1. Check the workflow logs to see what was detected
2. Rotate the secret immediately
3. Remove it from git history if already pushed
4. Add to allowlist only if it's a false positive

## Best Practices

1. **Never commit secrets** - Use `.env` files and environment variables
2. **Use `.env-example`** - Provide templates for required environment variables
3. **Review before committing** - Check `git diff --cached` before committing
4. **Rotate secrets regularly** - Even if not exposed, rotate secrets periodically
5. **Use secret management** - Consider using tools like HashiCorp Vault, AWS Secrets Manager, etc. for production

## Additional Resources

- [gitleaks documentation](https://github.com/gitleaks/gitleaks)
- [TruffleHog documentation](https://github.com/trufflesecurity/trufflehog)
- [OSV Scanner documentation](https://google.github.io/osv-scanner/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
