---
name: b-fix-push
description: Fix all reported issues, validate, commit, and push. Use when the user types /b-fix-push.
disable-model-invocation: true
---

## Purpose

Fix all reported issues, validate, commit, and push. Use when resolving feedback or pre-push verification. Use global git user for commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

## Steps

1. **Fix issues**: Address all errors, warnings, or feedback mentioned (lint, types, tests, reviews)
2. **Validate**: Run `pnpm qa` and resolve any failures
3. **Commit**: Follow steps in [b-git-commit](../b-git-commit/SKILL.md)
4. **Push**: `git push`

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
