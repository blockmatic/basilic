---
name: b-code-review
description: Review a change for evidenced defects and risks without editing it. Use when the user types /b-code-review.
disable-model-invocation: true
---

## Purpose and inputs

Use the specified diff, branch, or PR and its intended behavior. Establish the review base and inspect existing tests and surrounding implementation. Remain read-only unless fixes are also requested.

## Steps

1. Understand the trigger and expected result before judging the implementation. Read tests to learn which claims are actually exercised.
2. Check the dimensions below, concentrating on changed behavior and affected callers. Read domain rules when a boundary changes.
3. Validate suspected defects with a concrete execution path, failing case, or source evidence. Do not invent timings or vulnerabilities from appearances.
4. Order findings by impact. Give file/line, trigger, consequence, and smallest useful remedy. Separate blockers from optional suggestions.

## Review checklist

- [ ] Correctness: success, empty, invalid, failure, and concurrency cases relevant to this change.
- [ ] Clarity: names and control flow expose intent; refactoring removes complexity instead of moving it.
- [ ] Architecture: ownership, dependencies, generated sources, and existing shared helpers remain coherent.
- [ ] Security: changed input and authorization boundaries, secret exposure, and denied access paths are checked.
- [ ] Performance: changed queries, list bounds, repeated work, and client rendering have evidence appropriate to their risk.
- [ ] Verification: tests exercise behavior and the reported checks cover the actual change.

## Handoff

Report actionable findings first, then unresolved questions and verification limits. If none are found, say so with the review scope and residual risks. An inspection is not proof that tests passed and is not approval to merge.
