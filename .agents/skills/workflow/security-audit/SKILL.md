---
name: security-audit
description: Audit the change or tree against repository security docs and existing checks. Use when the user types /security-audit.
disable-model-invocation: true
---

## Purpose and inputs

Find security defects relative to repository security docs and existing scanners. Do not invent thresholds. Stay report-only unless the user asked to fix.

## Steps

1. Read the repository security docs. If missing, stop and ask; do not invent a bar.
2. Inspect dependencies, authz, secrets handling, and input boundaries that this repo already names.
3. Run existing security scripts or CI jobs from the docs or package.json. Record passed, failed, or not run.
4. If fixes are authorized, change the owning cause. Policy changes need a human.

## Verification

- [ ] Each finding cites docs, check, or source evidence.
- [ ] No new password, encryption, or header policy was introduced.
- [ ] No commit unless the user asked.

## Handoff

List findings, residual risk, and whether a security-doc follow-up is required.
