# Agent instructions

This repository uses **Cursor-native** AI workflows. Do not run a parallel process.

- `.cursor/rules/` — constraints (override skills)
- `.agents/skills/` — tech and `/workflow` from [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills); FIRST `/f-*` from [`npx skills add blockmatic/first`](https://github.com/blockmatic/first) (see [Cursor Skills](apps/docu/content/docs/development/cursor-skills.mdx))
- `apps/docu/content/docs/` — architecture, ADRs, how-to
- Product intent: `_first/basilic/PRODUCT.md` (instance path in `_first/FIRST.md`)
- FIRST: `_first/AGENTS.md` then `_first/ABOUT.md` then `_first/FIRST.md`; then `/f-*` and the instance path listed in FIRST.md. Factory: [`npx skills add blockmatic/first`](https://github.com/blockmatic/first). Workflow/tech: [`blockmatic/basilic-skills`](https://github.com/blockmatic/basilic-skills).

Details: `apps/docu/content/docs/development/ai-workflow.mdx`.
