---
name: b-code-review
description: Review a change for evidenced defects and risks without editing it. Use when the user types /b-code-review.
disable-model-invocation: true
---

## Purpose and inputs

Use the specified diff, branch, or PR and its intended behavior. Establish the review base and inspect existing tests and surrounding implementation. Remain read-only unless fixes are also requested.

## Steps

1. Understand the trigger and expected result before judging the implementation. Read tests to learn which claims are actually exercised.
2. Check the dimensions below, concentrating on changed behavior, affected callers, and failure paths. Read domain rules when a boundary changes.
3. Validate suspected defects with a concrete execution path, failing case, or source evidence. Do not invent timings or vulnerabilities from appearances.
4. Challenge verification claims: a listed check that was not run, or a typecheck offered as proof of a browser path, is a finding. Order findings by impact with file/line, trigger, consequence, and smallest useful remedy.

## Review checklist

- [ ] Correctness: success, empty, invalid, failure, and concurrency cases relevant to this change.
- [ ] Callers: existing call sites, generated clients, and public exports still match the new contract.
- [ ] Failure paths: error handling, denied access, and recovery are evidenced, not assumed.
- [ ] Clarity: names and control flow expose intent; refactoring removes complexity instead of moving it.
- [ ] Architecture: ownership, dependencies, generated sources, and existing shared helpers remain coherent. Generated files were not edited by hand.
- [ ] Security: changed input and authorization boundaries, secret exposure, and denied access paths are checked.
- [ ] Performance: changed queries, list bounds, repeated work, and client rendering have evidence appropriate to their risk.
- [ ] Verification: tests exercise behavior; claimed checks were actually run and cover the change. If a finding implies a new quality or security bar, escalate to `/f-quality` or `/f-security` instead of inventing policy.

## Handoff

Report actionable findings first, then unresolved questions and verification limits. If none are found, say so with the review scope and residual risks. An inspection is not proof that tests passed and is not approval to merge.
