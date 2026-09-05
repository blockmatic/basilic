---
name: run-all-tests-and-fix
description: Execute full test suite and systematically fix any failures, ensuring code quality and functionality. Use when the user types /run-all-tests-and-fix.
disable-model-invocation: true
---

## Purpose

Execute full test suite and systematically fix any failures, ensuring code quality and functionality.

## Steps

1. **Run test suite**: Execute all tests in project, capture output/identify failures, check both unit and integration tests
2. **Analyze failures**: Categorize by type (flaky, broken, new failures), prioritize fixes based on impact, check if failures related to recent changes
3. **Fix issues systematically**: Start with most critical failures, fix one issue at a time, re-run tests after each fix, verify all tests pass

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
