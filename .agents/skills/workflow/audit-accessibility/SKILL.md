---
name: audit-accessibility
description: Audit UI against repository a11y docs and tests; do not invent a WCAG level. Use when the user types /audit-accessibility.
disable-model-invocation: true
---

## Purpose and inputs

Audit the specified UI against accessibility docs and existing a11y tests. Stay report-only unless the user asked to fix.

## Steps

1. Read testing and frontend docs for the named a11y gate. If none exists, report that and run only existing repo tests.
2. Inspect semantic structure, keyboard access, names, and focus on changed UI.
3. Run the repository's a11y or component tests. Do not declare WCAG A/AA/AAA unless the repository docs name that level.
4. If fixes are authorized, apply the smallest semantic/ARIA change that meets the documented gate.

## Verification

- [ ] Findings cite docs, test, or rendered behavior.
- [ ] No WCAG level was invented.
- [ ] No unsolicited commit.

## Handoff

List issues, the gate used, and remaining manual checks.
