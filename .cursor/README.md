# Cursor Directory

Rules, skills, and MCP for AI-assisted development. Daily workflow: [AI Development Workflow](../apps/docu/content/docs/development/ai-workflow.mdx).

## Layout

- Root [`AGENTS.md`](../AGENTS.md) — always-on contract (all harnesses).
- [`rules/`](rules/) — glob-scoped constraints. Always-on `.mdc` files are short pointers to `AGENTS.md`.
- [`.agents/skills/`](../.agents/skills/) — gitignored; `pnpm setup` / `pnpm setup:skills` installs all skills from [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills) in one clone (`--skill '*'`) and does not rewrite [`skills-lock.json`](../skills-lock.json). Playbooks under `workflow/`. Details: [Cursor Skills](../apps/docu/content/docs/development/cursor-skills.mdx). There is no `.cursor/skills/` tree in this repo.
- [`mcp.json`](mcp.json) — MCP servers. Setup: [Cursor Setup](../apps/docu/content/docs/development/cursor-setup.mdx).

Type `/` in chat for playbooks (`/plan`, `/build`, `/review`, `/pr`, `/commit`). Tech skills load when relevant, or `@.agents/skills/<name>`.

## Related

- [AI Workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)
- Product: [`PRODUCT.md`](../PRODUCT.md) · design: [`DESIGN.md`](../DESIGN.md)
- [Cursor Setup](https://basilic-docs.vercel.app/docs/development/cursor-setup)
- [Cursor Skills](https://basilic-docs.vercel.app/docs/development/cursor-skills)
- [Cursor rules](https://cursor.com/docs/context/rules) · [skills](https://cursor.com/docs/context/skills)
