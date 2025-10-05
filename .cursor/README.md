# Cursor Directory

This directory contains rules, context information, and configurations for AI assistants (like GitHub Copilot, Claude, etc.) to better understand and work with our codebase.

## Context

The `context` directory holds specialized context or role files that provide factual information and background about the project:

- `architecture.md`: High-level architecture of the project
- `backend.md`: Backend architecture and infrastructure details
- `frontend.md`: Frontend architecture and technology stack
- `project.md`: Overall project information and guidelines

Context files should contain factual information, not behavioral rules. They help AI assistants understand how the system works but don't prescribe how to write code.

## Rules

The `rules` directory contains coding standards, patterns, and best practices that should be followed when writing code for this project. Rules are organized by domain:

- `base/`: Foundational rules applicable across the codebase
- `frontend/`: Frontend-specific rules (React, Next.js, etc.)
- `web3/`: Web3 and blockchain-specific rules
- `backend/`: Backend-specific rules
- `ai/`: AI integration rules and patterns

### Rule Structure

Good rules are focused, actionable, and scoped:

- Each rule file has frontmatter with `description` and appropriate `globs` patterns
- Rules use clear, direct language stating what to do and what to avoid
- Each rule file focuses on a specific technology or concern
- Rules include practical code examples to illustrate patterns
- Rules are under ~1.5K words to remain focused and digestible

### Using Rules

Rules can be referenced in prompts to AI assistants:

```
Please apply the TypeScript rules from .cursor/rules/base/typescript.mdc when refactoring this code.
```

## MCP Configuration

The `mcp.json` file configures Model Context Protocol (MCP) servers that enhance AI assistants with specialized capabilities:

- `shadcn`: Provides UI component management capabilities using shadcn/ui
- `v0`: Connects to v0.dev for UI design and generation capabilities
- `supabase`: Connects to Supabase for database and backend capabilities

### Authentication

- **shadcn**: Uses local CLI command execution
- **v0**: Requires `V0_API_KEY` environment variable
- **supabase**: Uses OAuth authentication flow via browser

For more information on Cursor rules and MCP, see the [official documentation](https://cursor.com/docs/context/rules) and [MCP documentation](https://cursor.com/docs/context/model-context-protocol).