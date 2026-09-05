---
name: b-add-error-handling
description: Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX. Use when the user types /b-add-error-handling.
disable-model-invocation: true
---

## Purpose

Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX.

## Steps

1. **Error Detection**: Identify potential failure points, edge cases, unhandled exceptions, missing validation, async/network call issues
2. **Error Handling Strategy**: Implement try-catch blocks, add input validation/sanitization, create meaningful error messages/logging, design graceful degradation
3. **Recovery Mechanisms**: Implement retry logic for transient failures, add fallback options, create circuit breakers, design proper error propagation
4. **User Experience**: Provide clear error messages, implement proper error status codes for APIs, add loading states/error boundaries for UI, include helpful suggestions

Follow the error-handling page listed from the technical docs path in `AGENTS.md`.

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
