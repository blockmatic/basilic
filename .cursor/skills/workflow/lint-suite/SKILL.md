---
name: lint-suite
description: Run project linters, apply fixes, and ensure codebase meets formatting/style requirements before merging changes. Use when the user types /lint-suite.
disable-model-invocation: true
---

Run project linters, apply fixes, and ensure codebase meets formatting/style requirements before merging changes.

1. **Execute linters**: Run standard lint command with autofix enabled if available, capture remaining errors/warnings, identify files requiring manual attention
2. **Resolve findings**: Apply targeted fixes keeping edits minimal/idiomatic, refactor repeated issues (unused variables, long functions), update configuration/suppressions only when justified
3. **Verify cleanliness**: Re-run lint command to ensure zero-issue result, spot-check key files for formatting/readability, stage changes with clear commit messages when satisfied

