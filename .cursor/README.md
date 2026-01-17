# Cursor Directory

AI-assisted development configuration for this codebase. Contains rules, commands, skills, and guides that enhance the development workflow with Cursor AI.

## Getting Started

**New to this codebase?** Start here:

1. Read [Cursor Workflow Overview](https://basilic-docs.vercel.app/docs/cursor-workflow) - Entry point with learning path
2. Skim [Quick Start Guide](https://basilic-docs.vercel.app/docs/cursor-workflow/quick-start) - 5-minute reference card
3. Explore [Complete Workflow](https://basilic-docs.vercel.app/docs/cursor-workflow/complete-workflow) - Comprehensive workflow reference

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
- **Framework skills**: Next.js 15, React best practices, Tailwind v4
- **Backend skills**: Fastify, Drizzle ORM, TypeBox, OpenTelemetry
- **AI skills**: Vercel AI SDK (core & UI), prompt engineering
- **Web3 skills**: Ethereum, Solana, Solidity, DeFi, NFTs
- **Architecture skills**: Senior architect, systematic planning, security practices
- **Development skills**: Code deduplication, skill creator

**Usage:** Read skill files for detailed guidance on specific technologies or patterns.

## MCP Configuration

Model Context Protocol (MCP) servers extend Cursor with specialized capabilities. Configuration is in `mcp.json`.

**Available servers:**
- `shadcn` - UI component management (local CLI, no auth required)
- `v0` - UI design and generation (requires `V0_API_KEY`)
- `github` - Repository management (requires `GITHUB_TOKEN`)
- `vercel` - Deployment and project management (requires `VERCEL_API_TOKEN`)

**Setup:**

1. Add required environment variables to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export V0_API_KEY=your_key_here
export GITHUB_TOKEN=your_token_here
export VERCEL_API_TOKEN=your_token_here
```

2. Reload shell: `source ~/.zshrc` (or `~/.bashrc`)
3. Restart Cursor

**Get API keys:**
- [v0.dev account settings](https://v0.dev) - V0_API_KEY
- [GitHub Personal Access Tokens](https://github.com/settings/tokens) - GITHUB_TOKEN
- [Vercel Account Tokens](https://vercel.com/account/tokens) - VERCEL_API_TOKEN

**Note:** All servers use `pnpm dlx` for command execution.

## Related Resources

**Project documentation:**
- [MCP Servers Guide](../../apps/docs/content/docs/mcp-servers/index.mdx) - Detailed usage documentation
- Project tech stack - See main repository README

**External documentation:**
- [Cursor Rules](https://cursor.com/docs/context/rules) - Official rules documentation
- [MCP Protocol](https://cursor.com/docs/context/model-context-protocol) - MCP specification
