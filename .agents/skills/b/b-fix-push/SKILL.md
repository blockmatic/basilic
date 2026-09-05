---
name: b-fix-push
description: Fix reported issues, validate, then commit and push using the Git playbooks. Use when the user types /b-fix-push.
disable-model-invocation: true
---

## Purpose and inputs

Invocation requests fix → validate → commit → push for the named issues. Preserve unrelated work. Never force-push, never `--no-verify`, never `--trailer`. This is not `/b-exec-push` (no PR) and not a merge or deploy.

## Steps

1. Address the reported errors, warnings, or feedback (lint, types, tests, reviews).
2. Run `pnpm qa` in Basilic (or the consuming repo's documented full gate). Fix failures before publishing.
3. Follow [b-git-commit](../b-git-commit/SKILL.md) for intended paths only.
4. Follow [b-git-push](../b-git-push/SKILL.md). Do not use a bare `git push` that skips those rules.

## Verification

- [ ] The reported issues and the full gate were addressed.
- [ ] Commit and push used the child playbooks.
- [ ] Unrelated local changes remain intact.

## Handoff

Report commit, branch, and push result. Do not open a PR unless the user asked `/b-git-create-pr` or `/b-exec-push`.
