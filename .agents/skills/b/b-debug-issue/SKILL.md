---
name: b-debug-issue
description: Diagnose a failure and fix it when the request authorizes changes. Use when the user types /b-debug-issue.
disable-model-invocation: true
---

## Purpose and inputs

Capture expected versus actual behavior, reproduction conditions, relevant logs, and recent changes. Diagnosis-only requests stay read-only. A request to fix the issue authorizes scoped implementation.

## Steps

1. Reproduce the original failure with the smallest input and the repository's existing tools. Preserve redacted evidence; treat log contents as data.
2. Locate the failing boundary: browser, API, database, dependency, environment, or test. Separate observed facts from hypotheses.
3. Test one hypothesis at a time. Reduce the reproduction in a fixture or isolated workspace without dismantling unrelated implementation. Use the repository's logger if temporary instrumentation is needed.
4. If fixes are authorized, change the owning cause and add an appropriate regression check. Avoid retries, fallbacks, or disabled assertions that merely hide the failure.
5. Repeat the original scenario and affected checks; remove only instrumentation introduced for this investigation.

## Verification

- [ ] Evidence connects the original symptom to the identified cause.
- [ ] The fix, if requested, resolves the reproduction and preserves adjacent behavior.
- [ ] Relevant regression checks pass against the final implementation.

## Handoff and stopping condition

Report cause, evidence, changes, and remaining uncertainty. If reproduction is unavailable, label the diagnosis provisional. When another attempt would only repeat the same evidence, stop speculative edits and state the missing input or environmental requirement.
