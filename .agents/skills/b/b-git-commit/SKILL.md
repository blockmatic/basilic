---
name: b-git-commit
description: Review and commit the task’s intended changes using repository conventions. Use when the user types /b-git-commit.
disable-model-invocation: true
---

## Purpose and inputs

Invocation requests a commit. Inspect staged and unstaged changes and the authorized task scope before staging anything. Use the default global Git identity and repository commit rules; never bypass hooks or add attribution trailers.

## Steps

1. Inspect the diff and distinguish task-owned changes from unrelated work, including pre-staged files. If the intended commit cannot be separated safely, clarify the file scope.
2. Check required validation evidence and documentation updates. Resolve failures caused by this task; report unrelated blockers honestly.
3. Stage explicit task-owned paths or hunks. Do not sweep unrelated or untracked work into the commit with a blanket add.
4. Write a Conventional Commit: lowercase type/scope, imperative summary of at most 60 characters, no period. Follow repository-specific scope conventions.
5. Commit with hooks enabled; inspect the result and remaining working tree.

## Verification and handoff

- [ ] Commit contains only the intended change and passes required hooks.
- [ ] Documentation and validation evidence describe that change.
- [ ] Unrelated work remains intact.

Return commit ID and concise scope. A commit request alone does not authorize pushing.
