---
name: fix-push
description: Fix all reported issues, validate, commit, and push. Use when the user types /fix-push.
disable-model-invocation: true
---

Fix all reported issues, validate, commit, and push. Use when resolving feedback or pre-push verification. Use global git user for commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

1. **Fix issues**: Address all errors, warnings, or feedback mentioned (lint, types, tests, reviews)
2. **Validate**: Run `pnpm qa` and resolve any failures
3. **Commit**: Follow steps in @.agents/skills/workflow/git-commit/SKILL.md
4. **Push**: `git push`

