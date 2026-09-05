---
name: b-git-pr-comments
description: Process reviewer feedback, apply required fixes, and draft replies without unsolicited commits. Use when the user types /b-git-pr-comments.
disable-model-invocation: true
---

## Purpose and inputs

Read unresolved PR comments, apply targeted fixes, and draft replies. Use the global git user if a commit is later requested. Never `--trailer`. Do not commit unless the user asked.

## Steps

1. Pull latest and read every unresolved comment. Group by file or theme.
2. List requested edits, clarifications, and blockers before changing code.
3. Apply one thread at a time. Run the affected tests or linters. Preserve unrelated work. Do not blanket-stage.
4. Draft a reply per comment: what changed, how to verify, remaining questions.

## Verification

- [ ] Each addressed thread maps to a file change or a written reply.
- [ ] Affected checks were run.
- [ ] No commit unless the user invoked `/b-git-commit`.

## Handoff

Return the reply drafts and remaining open threads. Point at `/b-git-commit` when the user wants to publish the fixes.
