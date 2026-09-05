---
name: b-use-tdd
description: Implement a requested increment with red-green-refactor. Use when the user types /b-use-tdd.
disable-model-invocation: true
---

## Purpose and inputs

Use TDD only when the user asked for it or the repository requires it. Follow the repo testing MDX and `vitest-v4` (or the stack's test skill). Do not commit unless asked.

## Steps

1. **Red**: Write a failing test for the desired behavior. Use real APIs where the repo tests do; mock only at documented boundaries.
2. **Green**: Write the smallest implementation that passes that test.
3. **Refactor**: Improve structure while tests stay green. Follow lint and file-organization rules.
4. Repeat for the next increment. Run the focused test file each cycle, then the affected suite.

## Verification

- [ ] The new test failed before the implementation existed (or that fact is explained).
- [ ] The focused tests pass after green and after refactor.
- [ ] No unsolicited commit.

## Handoff

Report the test files, the increment, and remaining uncovered behavior.
