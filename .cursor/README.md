# Cursor Directory

AI-assisted development configuration for this codebase. Contains rules, commands, skills, and guides that enhance the development workflow with Cursor AI.

## Getting Started

**New to this codebase?** Start here:

- [`commands/`](commands/) - Task-specific commands (code review, git, testing, etc.)
- [`rules/`](rules/) - Coding standards organized by domain

**Experienced developer?** Jump to:
- [`commands/`](commands/) - Task-specific commands (code review, git, testing, etc.)
- [`rules/`](rules/) - Coding standards organized by domain

## Directory Structure

### Workflow Documentation

Human-facing workflow documentation for AI-assisted development is now in the [documentation site](https://basilic-docs.vercel.app/docs/cursor-workflow).

**Start here:** [Cursor Workflow Overview](https://basilic-docs.vercel.app/docs/cursor-workflow)

Key guides:
- [Quick Start](https://basilic-docs.vercel.app/docs/cursor-workflow/quick-start) - 5-minute reference card with essential patterns
- [Complete Workflow](https://basilic-docs.vercel.app/docs/cursor-workflow/complete-workflow) - Complete development lifecycle (discovery → architecture → planning → execution → review)
- [Extensions](https://basilic-docs.vercel.app/docs/cursor-workflow/extensions) - VS Code/Cursor extensions and their roles

### Rules (`rules/`)

Coding standards and best practices organized by domain.

**Structure:**
- `base/` - Foundation (TypeScript, linting, error handling, logging, testing, environment)
- `frontend/` - React, Next.js, mobile-first, ShadcnUI, testing
- `backend/` - Fastify, testing
- `web3/` - Cosmos, Solana, Solidity, Viem, Wagmi, Ponder, multichain

**Usage pattern:**
```
Please apply @.cursor/rules/base/typescript.mdc when refactoring this code.
```

**Guidelines:**
- Focused and actionable (~1.5K words max)
- Include frontmatter with description and file patterns
- Provide code examples

### Commands (`commands/`)

Task-specific command definitions for common development workflows.

**Categories:**
- **Code quality**: `code-review.md`, `lint-fix.md`, `refactor-code.md`
- **Testing**: `write-unit-tests.md`, `write-api-test.md`, `run-all-tests-and-fix.md`
- **Git workflows**: `git-commit.md`, `git-push.md`, `create-pr.md`, `fix-git-issues.md`
- **Documentation**: `add-documentation.md`, `generate-api-docs.md`
- **Debugging**: `debug-issue.md`, `fix-compile-errors.md`, `docker-logs.md`
- **Planning**: `roadmap.md`, `setup-new-feature.md`, `clarify-task.md`
- **Architecture**: `info-architecture.md`, `diagrams.md`, `visualize.md`
- **Audits**: `security-audit.md`, `security-review.md`, `accessibility-audit.md`, `optimize-performance.md`

**Usage pattern:**
```
@.cursor/README.md /info-architecture
```

### Skills (`skills/`)

Specialized knowledge bundles for technologies and patterns.

**Categories:**
- **Framework skills**: Next.js 15, React best practices (Vercel Labs), Tailwind v4
- **Backend skills**: Fastify, Drizzle ORM, TypeBox, OpenTelemetry
- **AI skills**: Vercel AI SDK (core & UI)
- **Web3 skills**: Ethereum development, Solidity, Solana, smart contract security, web3 frontend
- **Tools & Patterns**: TypeScript advanced patterns, OpenAPI codegen

**Usage:** Read skill files for detailed guidance on specific technologies or patterns.

## MCP Configuration

Model Context Protocol (MCP) servers extend Cursor with specialized capabilities. Configuration is in `mcp.json`.

**Available servers:**
- `shadcnui-official` - Canonical shadcn/ui component definitions, variants, and single primitives (no auth required)
- `shadcnui-jpisnice-react` - shadcn/ui v4 blocks, demos, and page templates for React (requires `GITHUB_TOKEN`)
- `github` - Repository operations, issue management, and GitHub Actions logs (requires `GITHUB_TOKEN`)
- `coderabbit` - CodeRabbit AI code review comments and PR insights (requires `GITHUB_TOKEN`)
- `basilic-docs` - Basilic project documentation context (no auth required)
- `basilic-api` - Basilic API package context (no auth required)

**Note:** `shadcnui-jpisnice-react-native` exists for future React Native support but is not included in the current React workflow.

**Setup:**

1. Add required environment variables to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export GITHUB_TOKEN=your_token_here  # Required for github, coderabbit, and shadcnui-jpisnice-react
export GITHUB_PAT="$GITHUB_TOKEN"     # CodeRabbit MCP expects GITHUB_PAT
```

2. Reload shell: `source ~/.zshrc` (or `~/.bashrc`)
3. Restart Cursor
4. Enable MCP servers in Cursor:
   - Go to **Settings** > **Tools & MCP**
   - Turn on the MCP servers you want to use
   - Some servers (like `github`, `coderabbit`, `shadcnui-jpisnice-react`) require authentication - configure credentials from the settings panel if prompted

**Get API keys:**
- [GitHub Personal Access Tokens](https://github.com/settings/tokens) - GITHUB_TOKEN (required for GitHub MCP, CodeRabbit MCP, and shadcnui-jpisnice-react)

**CodeRabbit MCP Configuration:**
- Package: `coderabbitai-mcp@latest` (configured in `.cursor/mcp.json`)
- Environment variable: Set `GITHUB_PAT` in your shell (maps from `GITHUB_TOKEN` via `export GITHUB_PAT="$GITHUB_TOKEN"`)
- MCP config: Also configured in `.cursor/mcp.json` with `GITHUB_PAT: "${GITHUB_TOKEN}"` for redundancy
- Token scopes: Requires `repo` scope for private repositories or `public_repo` for public repositories

**Note:** All servers use `pnpm dlx` for command execution.

## Related Resources

**Project documentation:**
- [Cursor Setup Guide](apps/docu/content/docs/getting-started/cursor-setup.mdx) - MCP servers and IDE configuration
- Project tech stack - See main repository README

**External documentation:**
- [Cursor Rules](https://cursor.com/docs/context/rules) - Official rules documentation
- [MCP Protocol](https://cursor.com/docs/context/model-context-protocol) - MCP specification
