---
name: refactor-code
description: Refactor selected code while preserving behavior, then verify. Use when the user types /refactor-code.
disable-model-invocation: true
---

## Purpose and inputs

Use the selected files or a named concern. Capture current behavior with tests, types, or a manual scenario before editing. Refactor does not authorize commit, push, or PR.

## Steps

1. Record a baseline: what callers depend on, which checks prove it, and what must not change.
2. Improve structure in the smallest useful diff: extract duplication, clarify names, reduce nesting. Reuse existing packages. Do not add comments that restate the code.
3. Change algorithms or data structures only with measured evidence from the repository's profiler, tests, or traces. Do not invent timings or impact percentages.
4. Run the affected checks from the baseline. Restore behavior if they fail.

## Verification

- [ ] Observable behavior matches the baseline.
- [ ] Affected checks were run and recorded as passed, failed, or not applicable.
- [ ] No commit or push was created.

## Handoff

Explain what changed and why, with the verification evidence. Stop at local edits unless the user asked to publish via `/git-commit`.
