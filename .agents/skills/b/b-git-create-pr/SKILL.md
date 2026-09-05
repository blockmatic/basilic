---
name: b-git-create-pr
description: Create or update a reviewable pull request for the intended branch. Use when the user types /b-git-create-pr.
disable-model-invocation: true
---

## Purpose and inputs

Invocation requests publishing the intended branch and creating its PR. Inspect the base, branch diff, relevant issue, existing PR, and repository template first.

## Steps

1. Ensure task-owned changes are committed and validated using the repository's checks. Use [b-git-commit](../b-git-commit/SKILL.md) if needed, preserving unrelated work.
2. Push the intended branch using [b-git-push](../b-git-push/SKILL.md).
3. Write a standalone description: problem, resulting behavior, verification evidence, and material limitations. Follow the repository template; never create an empty description. Use a conventional PR title when the repository requires it. Keep a `BREAKING CHANGE:` footer in the body when required so squash-merge preserves it.
4. Reuse an existing PR for this branch rather than duplicating it. Use known applicable labels and requested reviewers; do not invent assignments.
5. With a CLI, write multiline text to a temporary file and pass the body-file option. Verify the resulting title, base, and description.

## Verification and handoff

- [ ] Correct source and target branches and a nonempty, accurate description.
- [ ] Validation claims match observed results; remaining blockers are explicit.
- [ ] PR URL resolves to the intended change.

Return the PR link. PR creation does not authorize merge or deployment.
