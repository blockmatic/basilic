---
name: b-generate-pr-description
description: Create comprehensive pull request description based on changes in this branch, formatted as proper markdown for GitHub PR. Use when the user types /b-generate-pr-description.
disable-model-invocation: true
---

## Purpose

Create comprehensive pull request description based on changes in this branch, formatted as proper markdown for GitHub PR.

## Steps

1. **Summary**: Provide clear, concise summary of what PR accomplishes
2. **Changes Made**: List key changes (code and non-code), highlight breaking changes
3. **Testing**: Describe how changes were tested, include new test cases, note manual testing performed
4. **Related Issues**: Link to related issues/tickets, use closing keywords if PR resolves issues
5. **Additional Notes**: Deployment considerations, follow-up work required, notes for reviewers

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
