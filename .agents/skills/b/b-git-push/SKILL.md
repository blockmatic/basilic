---
name: b-git-push
description: Validate and push the intended branch while preserving unrelated work. Use when the user types /b-git-push.
disable-model-invocation: true
---

## Purpose and inputs

Invocation requests pushing the current task. Inspect branch, upstream, staged/unstaged changes, and repository Git rules. Do not infer that unrelated working-tree edits belong in the push.

## Steps

1. Review the intended diff and required check results. Remove only temporary debug code introduced by the task.
2. If task changes need committing, follow [b-git-commit](../b-git-commit/SKILL.md). Preserve unrelated staged and untracked files.
3. Push to the inspected upstream. If none exists, use the repository's intended remote and current branch; resolve ambiguity before publishing.
4. For a rejected push, inspect divergence and use the repository's non-destructive synchronization workflow. Never force-push or bypass hooks.

## Verification and handoff

- [ ] Required checks and commit hooks passed.
- [ ] The intended branch was accepted by the remote.
- [ ] Unrelated local changes remain intact.

Report branch and push result. Do not create a PR, deploy, or start watching CI unless requested.
