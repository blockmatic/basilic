---
name: git-pr-comments
description: Process outstanding reviewer feedback, apply required fixes, and draft clear responses for each GitHub pull-request comment. Use when the user types /git-pr-comments.
disable-model-invocation: true
---

Process outstanding reviewer feedback, apply required fixes, and draft clear responses for each GitHub pull-request comment. Use global git user for commits—never cursor/system identity. Never use `--trailer` for Co-authored-by or similar.

1. **Sync and audit comments**: Pull latest branch changes, open PR conversation view and read every unresolved comment, group comments by affected files/themes
2. **Plan resolutions**: List requested code edits for each thread, identify clarifications/additional context needed, note dependencies/blockers before implementing changes
3. **Implement fixes**: Apply targeted updates addressing one comment thread at a time, run relevant tests/linters after impactful changes, stage changes with commits referencing addressed feedback
4. **Draft responses**: Summarize action taken/reasoning for each comment, link to commits/lines when clarification helps reviewers verify, highlight remaining questions/follow-up needs

