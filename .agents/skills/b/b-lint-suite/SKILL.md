---
name: b-lint-suite
description: Run project linters, apply fixes, and re-run until the suite is clean. Use when the user types /b-lint-suite.
disable-model-invocation: true
---

## Purpose and inputs

Run the repository lint scripts and apply the smallest idiomatic fixes. This is not a merge gate and does not commit.

## Steps

1. Run the documented lint command with autofix when the repo provides one. Capture remaining errors.
2. Fix remaining issues with minimal diffs. Change suppressions or config only with evidence they belong.
3. Re-run lint. Spot-check the diff. Do not stage or commit.

## Verification

- [ ] Lint was re-run after edits.
- [ ] Remaining failures are listed with files.
- [ ] Working tree was not committed.

## Handoff

Report lint result. Use `/b-git-commit` only if the user asked to publish.
