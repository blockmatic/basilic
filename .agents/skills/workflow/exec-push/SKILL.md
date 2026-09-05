---
name: exec-push
description: Implement the requested change, validate, commit, push, and create its PR. Use when the user types /exec-push.
disable-model-invocation: true
---

## Purpose and inputs

Invocation requests the complete implementation-to-PR path. Read the task or plan, repository instructions, branch state, affected docs, and scripts. Do not broaden the request to merge or deployment.

## Steps

1. Inspect the working tree and current branch. If a new branch is needed, use the repository naming convention and preserve uncommitted work; do not blindly pull into a dirty checkout.
2. Implement and review the requested change in complete slices using [build](../build/SKILL.md).
3. Update affected technical docs and nearest README. Run the repository's full pre-push gate (`pnpm qa` in Basilic); diagnose failures before publishing.
4. Commit task-owned changes with [git-commit](../git-commit/SKILL.md), then push with [git-push](../git-push/SKILL.md).
5. Create or update the PR with [git-create-pr](../git-create-pr/SKILL.md). Use the repository PR template. Preserve a `BREAKING CHANGE:` footer in the body when the title uses `!` (squash uses `PR_TITLE` + `PR_BODY`). Never open an empty description.

## Verification and handoff

- [ ] Requested acceptance criteria and required validation pass.
- [ ] Commit and push contain only intended work, with hooks enabled.
- [ ] PR targets the correct base and explains the final behavior.

Return the commit, branch, PR link, and checks. If a gate fails, report the blocker and the completed local work; do not present an unpublished change as shipped.
