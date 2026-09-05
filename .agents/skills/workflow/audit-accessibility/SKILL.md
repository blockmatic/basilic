---
name: audit-accessibility
description: Audit UI against repository Quality/a11y gates; do not invent a WCAG level. Use when the user types /audit-accessibility.
disable-model-invocation: true
---

## Purpose and inputs

Audit the specified UI against `_first/.../QUALITY.md`, accessibility docs, and existing a11y tests. The Quality station owns the bar. Stay report-only unless the user asked to fix.

## Steps

1. Load `/f-quality` and the Quality overlay. Use the named a11y gate. If none exists, report that and run only existing repo tests.
2. Inspect semantic structure, keyboard access, names, and focus on changed UI.
3. Run the repository's a11y or component tests. Do not declare WCAG A/AA/AAA unless the overlay names that level.
4. If fixes are authorized, apply the smallest semantic/ARIA change that meets the overlay.

## Verification

- [ ] Findings cite overlay, test, or rendered behavior.
- [ ] No WCAG level was invented.
- [ ] No unsolicited commit.

## Handoff

List issues, the gate used, and remaining manual checks.
