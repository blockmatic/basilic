---
name: code-review
description: Perform thorough code review verifying functionality, maintainability, and security. Use when the user types /code-review.
disable-model-invocation: true
---

Perform thorough code review verifying functionality, maintainability, and security. Focus on architecture, readability, performance, provide actionable suggestions.

1. **Understand change**: Read PR description/issues for context, identify scope of files/features impacted, note assumptions/questions
2. **Validate functionality**: Confirm code delivers intended behavior, exercise edge cases/guard conditions, check error handling/logging
3. **Assess quality**: Ensure functions focused/names descriptive/code readable, watch for duplication/dead code/missing tests, verify documentation updated
4. **Review security/risk**: Look for injection points/insecure defaults/missing validation, confirm secrets not exposed, evaluate performance/scalability impacts

