# Agent instructions

This repository uses **Cursor-native** AI workflows. Do not run a parallel process.

- `.cursor/rules/` — constraints (override skills)
- `.agents/skills/` — tech patterns (`<topic>-v<major>/`) and slash playbooks under `workflow/`; install/refresh via `pnpm dlx skills@latest add blockmatic/basilic-skills` (see [Cursor Skills](apps/docu/content/docs/development/cursor-skills.mdx)). Catalog: [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills)
- `apps/docu/content/docs/` — architecture, ADRs, how-to
- FIRST: `_first/AGENTS.md` then `_first/ABOUT.md` then `_first/FIRST.md`; then `_first/principles/X.md` and the instance path listed in FIRST.md. Factory source: [`blockmatic/first`](https://github.com/blockmatic/first).

Details: `apps/docu/content/docs/development/ai-workflow.mdx`.
