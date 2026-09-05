---
name: add-documentation
description: Add comprehensive documentation for current code/feature per project standards (README, technical docs site, or inline comments). Use when the user types /add-documentation.
disable-model-invocation: true
---

## Purpose and inputs

Document the current code or feature. Follow `.cursor/rules/base/docs.mdc` and `.cursor/rules/base/readme.mdc`. Do not commit unless asked.

## Steps

Write to the layer that owns the change:

| Layer | Role | Update when |
| --- | --- | --- |
| Technical docs (path in `AGENTS.md`) | Architecture, ADRs, how-to | Behavior, architecture, commands, conventions, or workflow changed |
| `.cursor/rules` | Short constraints | A convention the agent must not violate changed |
| Nearest README | How to run this app/package; links only | Scripts, setup, or package purpose changed |

Inline comments only when the code is otherwise misleading. Do not copy MDX into rules or READMEs. Do not `@`-attach MDX.

1. **Identify the topic**: Matching docs section, then existing topic page (create a page only if none fits)
2. **Write or patch MDX** if the canonical explanation changed
3. **Patch README** only for run/setup/scripts; link the MDX
4. **Patch the glob-matched `.mdc`** only if a constraint changed

## Verification

- [ ] The owning docs layer matches the kind of change.
- [ ] READMEs link to MDX instead of duplicating it.
- [ ] No unsolicited commit.

## Handoff

Report which files changed and which layers were intentionally left alone.
