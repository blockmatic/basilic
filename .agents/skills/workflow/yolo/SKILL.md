---
name: yolo
description: Run the repository's full local quality gate and fix failures without publishing. Use when the user types /yolo.
disable-model-invocation: true
---

## Purpose and inputs

Run the documented full gate (`pnpm qa` in Basilic, or the repo's equivalent) and fix failures. Compose [lint-suite](../lint-suite/SKILL.md), [run-all-tests-and-fix](../run-all-tests-and-fix/SKILL.md), and [code-review](../code-review/SKILL.md) as needed. Do not commit, push, merge, or deploy. Do not edit `.env`, secrets, or unrelated dotfiles. Do not delete features to make a gate pass.

## Steps

1. Run the documented lint, type, build, and test scripts from package.json. Fix owning causes. Re-run the failed command.
2. Optionally review the task diff with `/code-review` (read-only). Apply fixes only for defects you can evidence.
3. If CodeRabbit or CI comments exist and the user asked to consume them, follow [coderabbit](../coderabbit/SKILL.md) or [git-pr-comments](../git-pr-comments/SKILL.md) without committing.
4. Stop when the gate is green or when remaining failures need a human (secrets, product scope, missing env).

## Verification

- [ ] Each gate command is recorded as passed, failed, or not applicable.
- [ ] No secrets, `.env`, or unrelated dotfiles were edited.
- [ ] No Git publish happened.

## Handoff

Summarize failures, fixes, and remaining blockers. If they want a local commit, use `/git-commit`. Use `/git-push` only after they explicitly request publication of an already-committed branch.
