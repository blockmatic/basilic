---
name: add-error-handling
description: Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX. Use when the user types /add-error-handling.
disable-model-invocation: true
---

## Purpose

Implement comprehensive error handling for current code to make it robust and resilient while maintaining good UX.

## Steps

1. **Error Detection**: Identify potential failure points, edge cases, unhandled exceptions, missing validation, async/network call issues
2. **Error Handling Strategy**: Implement try-catch blocks, add input validation/sanitization, create meaningful error messages/logging, design graceful degradation
3. **Recovery Mechanisms**: Retry only when the write is replay-safe (idempotency key or equivalent deduplication). Otherwise keep an explicit no-retry path. Permitted retries need a bounded deadline, cancellation, and backoff. Add fallbacks and circuit breakers only where they do not hide the owning failure
4. **User Experience**: Provide clear error messages, implement proper error status codes for APIs, add loading states/error boundaries for UI, include helpful suggestions

Follow the error-handling page listed from the technical docs path in `AGENTS.md`.

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
