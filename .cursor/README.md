# Cursor Directory

Rules, skills, and MCP for AI-assisted development. Daily workflow: [AI Development Workflow](../apps/docu/content/docs/development/ai-workflow.mdx).

## Layout

- Root [`AGENTS.md`](../AGENTS.md) — always-on contract (all harnesses).
- [`rules/`](rules/) — glob-scoped constraints. Always-on `.mdc` files are short pointers to `AGENTS.md`.
- [`.agents/skills/`](../.agents/skills/) — gitignored; `pnpm setup:skills` installs from [`skills-lock-manifest.mjs`](../scripts/skills-lock-manifest.mjs) (`--agent cursor` only; removes `.claude/` and `.cursor/skills/`). Hashes in [`skills-lock.json`](../skills-lock.json). Basilic playbooks land under `workflow/w-*`. Details: [Cursor Skills](../apps/docu/content/docs/development/cursor-skills.mdx).
- [`mcp.json`](mcp.json) — MCP servers. Setup: [Cursor Setup](../apps/docu/content/docs/development/cursor-setup.mdx).

Type `/` in chat for Basilic `/w-*` (`/w-plan`, `/w-grill`, `/w-wayfinder`, `/w-ship`). `/w-plan` explores via `/w-council` first. Tech skills load when relevant, or `@.agents/skills/<name>`.

## Related

- [AI Workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)
- Design: [`DESIGN.md`](../DESIGN.md)
- [Cursor Setup](https://basilic-docs.vercel.app/docs/development/cursor-setup)
- [Cursor Skills](https://basilic-docs.vercel.app/docs/development/cursor-skills)
- [Cursor rules](https://cursor.com/docs/context/rules) · [skills](https://cursor.com/docs/context/skills)
