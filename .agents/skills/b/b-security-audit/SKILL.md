---
name: b-security-audit
description: Audit the change or tree against the repository Security overlay and existing checks. Use when the user types /b-security-audit.
disable-model-invocation: true
---

## Purpose and inputs

Find security defects relative to `_first/.../SECURITY.md`, repository security docs, and existing scanners. Do not invent thresholds. Stay report-only unless the user asked to fix.

## Steps

1. Load `/f-security` and the Security overlay. If missing, stop and ask; do not invent a bar.
2. Inspect dependencies, authz, secrets handling, and input boundaries that this repo already names.
3. Run existing security scripts or CI jobs from the overlay or package.json. Record passed, failed, or not run.
4. If fixes are authorized, change the owning cause. Policy changes go through `/f-security`.

## Verification

- [ ] Each finding cites overlay, check, or source evidence.
- [ ] No new password, encryption, or header policy was introduced.
- [ ] No commit unless the user asked.

## Handoff

List findings, residual risk, and whether `/f-security` must own a follow-up.
