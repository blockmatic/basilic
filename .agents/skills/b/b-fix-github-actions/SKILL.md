---
name: b-fix-github-actions
description: Retrieve GitHub Actions logs with gh, analyze failures, and fix CI errors locally. Use when the user types /b-fix-github-actions.
disable-model-invocation: true
---

## Purpose and inputs

Fix failing GitHub Actions for the current branch. Use **`gh`**, never GitHub MCP for Actions logs. Do not commit unless the user asked.

## Steps

1. `git branch --show-current`; confirm pushed (`git status -sb`); `gh pr view` or `gh pr list --head "$(git branch --show-current)"`
2. `gh pr checks`; `gh run list --branch "$(git branch --show-current)" --limit 10`; failed run → `gh run view <id> --log-failed`; artifacts → `gh run download <id>`
3. Parse logs for tests, lint, build, missing deps, env, timeouts. Change the owning cause.
4. Re-run the same local commands the workflow uses. Push and `gh pr checks` only when the user asked to publish. Do not add `gh run watch` to every push.

## Verification

- [ ] The failing check's log is the evidence, not a guess.
- [ ] Local equivalent of the failed job was re-run.
- [ ] No commit or push unless the user requested `/b-git-commit` or `/b-git-push`.

## Handoff

Report the failed job, cause, local result, and whether the remote check still needs a push.
