---
name: b-yolo
description: Run the repository's full local quality gate and fix failures without publishing. Use when the user types /b-yolo.
disable-model-invocation: true
---

## Purpose and inputs

Run the documented full gate (`pnpm qa` in Basilic, or the repo's equivalent) and fix failures. Compose [b-lint-suite](../b-lint-suite/SKILL.md), [b-run-all-tests-and-fix](../b-run-all-tests-and-fix/SKILL.md), and [b-code-review](../b-code-review/SKILL.md) as needed. Do not commit, push, merge, or deploy. Do not edit `.env`, secrets, or unrelated dotfiles. Do not delete features to make a gate pass.

## Steps

1. Run the documented lint, type, build, and test scripts from package.json. Fix owning causes. Re-run the failed command.
2. Optionally review the task diff with `/b-code-review` (read-only). Apply fixes only for defects you can evidence.
3. If CodeRabbit or CI comments exist and the user asked to consume them, follow [b-coderabbit](../b-coderabbit/SKILL.md) or [b-git-pr-comments](../b-git-pr-comments/SKILL.md) without committing.
4. Stop when the gate is green or when remaining failures need a human (secrets, product scope, missing env).

## Verification

- [ ] Each gate command is recorded as passed, failed, or not applicable.
- [ ] No secrets, `.env`, or unrelated dotfiles were edited.
- [ ] No Git publish happened.

## Handoff

Summarize failures, fixes, and remaining blockers. Publish only if the user then asks `/b-git-commit`.
