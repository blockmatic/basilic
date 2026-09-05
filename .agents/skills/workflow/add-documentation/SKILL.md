---
name: add-documentation
description: Add comprehensive documentation for current code/feature per project standards (README, docs site, or inline comments). Use when the user types /add-documentation.
disable-model-invocation: true
---

Add documentation for the current code/feature. Follow `.cursor/rules/base/docs.mdc` and `.cursor/rules/base/readme.mdc`.

## Where to write

| Layer | Role | Update when |
| --- | --- | --- |
| `apps/docu/content/docs/product/` | Intent, feature map, roadmap | Goals, shipped vs intended, horizons changed |
| `apps/docu/content/docs/` other MDX | Architecture, ADRs, how-to, Product Ready | Behavior, architecture, commands, conventions, or workflow changed |
| GitHub Issues | Backlog | Later bets and work items — not `__dev/`, not `BACKLOG.md` |
| `__dev/` | Scratch | Notes that have not graduated. Not Fact |
| `.cursor/rules` | Short constraints | A convention the agent must not violate changed |
| Nearest README | How to run this app/package; links only | Scripts, setup, or package purpose changed |

Inline comments only when the code is otherwise misleading. Do not copy MDX into rules or READMEs. Do not `@`-attach MDX. There is no 13th FIRST station and no root `PRODUCT.md` / `ROADMAP.md`.

1. **Identify the topic**: Matching docs section, then existing topic page (create a page only if none fits)
2. **Write or patch MDX** if the canonical explanation changed
3. **Patch README** only for run/setup/scripts; link the MDX
4. **Patch the glob-matched `.mdc`** only if a constraint changed
5. **Open or update a GitHub Issue** if the item is backlog, not documentation
