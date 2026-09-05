---
name: f
description: FIRST factory dispatcher. Lists /f-* station and role skills. Use when the user types /f or /f-product, /f-journeys, /f-analyst.
disable-model-invocation: true
---

FIRST invoke namespace. Nested playbooks are sibling folders (`f-<name>/SKILL.md`). Cursor loads them as `/f-<name>`. Claude Code: `/f <alias>` or read `./f-<name>/SKILL.md`.

If there is no argument, list the index below and stop. Do not apply all stations.

If `$ARGUMENTS` (or the rest of the message after `/f`) is a known token, Read `./<folder>/SKILL.md` and follow it.

## Aliases → folder

- `product` → `f-product`
- `journeys`, `design`, `designer` → `f-journeys`
- `data`, `analyst` → `f-analyst`
- `documentation`, `docs`, `ia` → `f-info-architect`
- `ai`, `ai-expert` → `f-ai-expert`
- `architecture` → `f-architecture`
- `api` → `f-api`
- `workflow`, `pipelines` → `f-workflow`
- `quality` → `f-quality`
- `security` → `f-security`
- `operations` → `f-operations`

Unknown token: say so, print this index, stop.

## Index

| Slash | Station or role |
|---|---|
| `/f-product` | Product |
| `/f-journeys` | Journeys (`/f-designer` is an alias) |
| `/f-architecture` | Architecture |
| `/f-analyst` | Data |
| `/f-api` | API |
| `/f-info-architect` | Documentation |
| `/f-workflow` | Workflow (`/f-pipelines` is an alias) |
| `/f-quality` | Quality |
| `/f-security` | Security |
| `/f-operations` | Operations |
| `/f-ai-expert` | Agents, evals, assistant (not an eleventh station) |

Always load `./references/analyst.md` before the child spec.
