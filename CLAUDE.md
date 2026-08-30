# Claude Project Instructions

This repository uses **Cursor-native AI workflows**. Do not run a parallel process.

## Source of truth

- `.cursor/rules/` — constraints (globs; these take precedence over skills)
- `.cursor/skills/` — tech patterns (`<topic>-v<major>/`) and slash playbooks (`.cursor/skills/workflow/<name>/SKILL.md`). Versioning and updates: `apps/docu/content/docs/development/cursor-skills.mdx`.

## Behavior

1. Follow Cursor rules first. If a rule exists, it overrides generic best practice.
2. Use project skills as implementation references. Prefer them over alternative frameworks.
3. Workflow playbooks live under `.cursor/skills/workflow/` (e.g. `plan-feature`, `exec-push`, `git-commit`). In Cursor, type `/name`. Here, read that `SKILL.md`.
4. On conflict with project standards: follow the rules, note the conflict, propose an aligned fix.
