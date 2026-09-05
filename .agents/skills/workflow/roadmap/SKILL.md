---
name: roadmap
description: Analyze codebase and generate visual roadmap of potential features and improvements. Use when the user types /roadmap.
disable-model-invocation: true
---

Analyze codebase and generate a visual roadmap of potential features and improvements. Track progress with todos.

Canonical horizon file in Basilic: `apps/docu/content/docs/product/roadmap.mdx`. Backlog = GitHub Issues. `__dev/` is scratch.

1. **Scan codebase**: Scan architecture, patterns, conventions; look for opportunities (missing patterns, performance, DX, user-facing features, refactors)
2. **Identify opportunities**: Feature gaps and improvements. Separate R0 / R-demo / later / not-now using the existing roadmap if present
3. **Create timeline diagram**: Phased overview (Quick Wins, Medium Effort, Strategic)
4. **Create current vs proposed flowchart**: Solid borders for existing, dashed for proposed
5. **Ask user**: Ask whether to update `product/roadmap.mdx` and/or open GitHub Issues. Plans follow @.cursor/rules/base/general.mdc (References, assumptions, deferrals)
6. **Output**: Show the assessment in chat. **Write** `apps/docu/content/docs/product/roadmap.mdx` when the user confirms a durable horizon change. Do not leave the roadmap only in chat. Do not write `ROADMAP.md` at repo root. Do not treat `__dev/` as the roadmap.
