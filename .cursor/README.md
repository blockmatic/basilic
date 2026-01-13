# Cursor Directory

Configuration and guidelines for AI assistants working with this codebase.

## Structure

### Context (`context/`)

Factual information about the project (not behavioral rules):

- `architecture.md`: High-level architecture
- `backend.md`: Backend architecture and infrastructure
- `frontend.md`: Frontend architecture and tech stack
- `project.md`: Project information and guidelines

### Rules (`rules/`)

Coding standards and best practices organized by domain:

- `base/`: Foundational rules (TypeScript, environment variables, MCP, general patterns)
- `frontend/`: Frontend rules (React, Next.js, mobile-first, ShadcnUI, testing)
- `web3/`: Web3 rules (Cosmos, Solana, Solidity, Viem, Wagmi, Ponder, multichain)
- `backend/`: Backend rules (Fastify, ts-rest, testing)

**Rule guidelines:**

- Focused, actionable, and scoped (~1.5K words max)
- Include frontmatter with `description` and `globs` patterns
- Use clear, direct language with code examples

**Usage:**

```
Please apply the TypeScript rules from .cursor/rules/base/typescript.mdc when refactoring this code.
```

### Prompts (`prompts/`)

Reusable prompt templates:

- `refine-plan.md`: Checklist for refining implementation plans
- `debug-plan.md`: Guidelines for investigating failures and creating fix plans

### MCP Configuration (`mcp.json`)

Model Context Protocol servers for specialized capabilities:

- `shadcn`: UI component management (shadcn/ui)
- `v0`: UI design and generation (v0.dev)
- `github`: Repository management
- `vercel`: Deployment and project management

**Authentication:**

- `shadcn`: Local CLI (no API key)
- `v0`: `V0_API_KEY`
- `github`: `GITHUB_TOKEN`
- `vercel`: `VERCEL_API_TOKEN`

**Setting API Keys:**

Add the required API keys to your shell profile so Cursor can access them:

**For zsh (recommended):**
```bash
# Add to ~/.zshrc
export V0_API_KEY=your_v0_api_key_here
export GITHUB_TOKEN=your_github_token_here
export VERCEL_API_TOKEN=your_vercel_api_token_here

# Then reload
source ~/.zshrc
```

**For bash:**
```bash
# Add to ~/.bashrc
export V0_API_KEY=your_v0_api_key_here
export GITHUB_TOKEN=your_github_token_here
export VERCEL_API_TOKEN=your_vercel_api_token_here

# Then reload
source ~/.bashrc
```

**Important:** Restart Cursor after setting the environment variables for them to take effect.

**Getting API Keys:**
- `V0_API_KEY`: Get from [v0.dev account settings](https://v0.dev)
- `GITHUB_TOKEN`: Create at [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- `VERCEL_API_TOKEN`: Create at [Vercel Account Tokens](https://vercel.com/account/tokens)

**Package Manager:** All MCP servers use `pnpm dlx` for command execution, consistent with the project's package manager choice (pnpm).

## Tech Stack

This project uses:
- **Node.js**: Runtime environment
- **pnpm**: Package manager
- **Fastify**: Backend framework
- **ts-rest**: Contract-first API framework with strict type safety
- **Next.js**: Frontend framework
- **Vercel**: Deployment platform
- **Zod**: Schema validation and type inference
- **OpenAPI**: API documentation (generated from ts-rest contracts)

## Documentation

- [MCP Servers Guide](/docs/mcp-servers) - See [MCP Servers Usage Guide](../../apps/docs/content/docs/mcp-servers/index.mdx) for detailed documentation
- [Cursor Rules](https://cursor.com/docs/context/rules)
- [MCP Documentation](https://cursor.com/docs/context/model-context-protocol)
