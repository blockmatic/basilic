---
name: add-error-handling
description: Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX. Use when the user types /add-error-handling.
disable-model-invocation: true
---

Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX. Follow architecture, strategies, and decisions in `@apps/docu/`. After implementation (for both new features and fixes), update docs, readme, and cursor rules if required to keep them aligned.

1. **Error Detection**: Identify potential failure points, edge cases, unhandled exceptions, missing validation, async/network call issues
2. **Error Handling Strategy**: Implement try-catch blocks, add input validation/sanitization, create meaningful error messages/logging, design graceful degradation
3. **Recovery Mechanisms**: Implement retry logic for transient failures, add fallback options, create circuit breakers, design proper error propagation
4. **User Experience**: Provide clear error messages, implement proper error status codes for APIs, add loading states/error boundaries for UI, include helpful suggestions

Follow rules defined in @apps/docu/content/docs/architecture/error-handling.mdx

