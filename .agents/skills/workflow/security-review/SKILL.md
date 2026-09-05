---
name: security-review
description: Review current code against the repository Security overlay; report evidence and remedies. Use when the user types /security-review.
disable-model-invocation: true
---

## Purpose and inputs

Review the specified diff or tree for security defects against the repo Security overlay and existing tests. Read-only unless fixes are requested. Do not invent CORS, encryption, or password policy.

## Steps

1. Load `/f-security` and `SECURITY.md` (or the instance path). Use that bar.
2. Check authn/authz, input validation, secret handling, and data exposure on the changed paths.
3. Validate each suspected issue with a trigger and consequence. Skip invented CVEs and timings.
4. If a finding implies a new policy, escalate to `/f-security` instead of encoding it here.

## Verification

- [ ] Findings have file/line and an execution path.
- [ ] Overlay thresholds were not expanded.
- [ ] No unsolicited commit.

## Handoff

Report defects, suggested remedies, and policy questions for `/f-security`.
