---
name: debug-browser
description: Reproduce and resolve an authorized browser issue using runtime evidence. Use when the user types /debug-browser.
disable-model-invocation: true
---

## Purpose and inputs

Use the affected URL, expected interaction, and available browser tools. Inspect the app's README and browser-testing conventions first.

## Steps

1. Reproduce the interaction and collect relevant DOM, network, and console evidence before adding instrumentation.
2. Trace the failure to its owning client or server boundary. Use the repository logger for necessary temporary traces; avoid secrets in captured output.
3. Apply the smallest authorized fix, then replay the same interaction and relevant failure or empty states.
4. Run affected automated checks and remove temporary traces introduced here. If tools or credentials block reproduction, report the exact limitation rather than looping without new evidence.

## Verification and handoff

- [ ] Original interaction succeeds in the browser after the fix.
- [ ] Relevant failures, loading states, and console/network errors were inspected.
- [ ] Reported runtime evidence and automated results are distinguished.

Return the cause, changed behavior, and evidence. Do not ask the user to test something the available tools can verify.
