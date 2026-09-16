# Cursor Directory

Rules, skills, and MCP for AI-assisted development. Daily workflow: [AI Development Workflow](../apps/docu/content/docs/development/ai-workflow.mdx).

## Layout

- [`rules/`](rules/) — constraints. Glob-scoped except `base/general.mdc`, `base/naming.mdc`, `base/git.mdc`, `base/file-organization.mdc` (always on).
- [`.agents/skills/`](../.agents/skills/) — on-demand expertise (`<topic>-v<major>/`) and slash playbooks under `workflow/`. Refresh from [blockmatic/basilic-skills](https://github.com/blockmatic/basilic-skills) (`pnpm dlx skills@latest add blockmatic/basilic-skills --skill '*' -a cursor --copy -y`). Details: [Cursor Skills](../apps/docu/content/docs/development/cursor-skills.mdx). There is no `.cursor/skills/` tree in this repo.
- [`mcp.json`](mcp.json) — MCP servers. Setup: [Cursor Setup](../apps/docu/content/docs/development/cursor-setup.mdx).

Type `/` in chat for playbooks (`/plan`, `/build`, `/git-create-pr`, `/git-commit`, `/retro`). Tech skills load when relevant, or `@.agents/skills/<name>`.

## Related

- [AI Workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)
- Product: [`PRODUCT.md`](../PRODUCT.md) · design: [`DESIGN.md`](../DESIGN.md)
- [Cursor Setup](https://basilic-docs.vercel.app/docs/development/cursor-setup)
- [Cursor Skills](https://basilic-docs.vercel.app/docs/development/cursor-skills)
- [Cursor rules](https://cursor.com/docs/context/rules) · [skills](https://cursor.com/docs/context/skills)
