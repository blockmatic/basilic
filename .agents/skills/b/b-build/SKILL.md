---
name: b-build
description: Implement an agreed task incrementally and verify the result. Use when the user types /b-build.
disable-model-invocation: true
---

## Purpose and inputs

Use an existing plan or a sufficiently clear implementation request. Read the repository instructions, affected README/scripts, matching rules and skills, and technical docs. Resolve missing consequential decisions through the matching FIRST station.

## Steps

1. Inspect the working tree and identify the files owned by this task. State the acceptance conditions; preserve unrelated changes.
2. Implement one complete slice using existing packages and patterns. Change owning schemas and run documented generators instead of editing generated clients or migrations.
3. Run the smallest meaningful check for the changed behavior. A reproducible logic defect should have a regression check; use TDD when requested or required by the repository, not as a ritual for prose edits.
4. Investigate failed checks before building dependent work. Separate regressions caused here from pre-existing or environmental failures; never weaken checks to obtain a pass.
5. Review the diff and update matching technical docs and nearest README when behavior or conventions change. Update the product overlay only when product facts change.

## Verification

- [ ] The requested acceptance conditions are met.
- [ ] Affected checks ran against the final change; any unverified behavior is named.
- [ ] Sources, generated artifacts, and documentation agree.
- [ ] The diff preserves unrelated work and contains no temporary instrumentation added here.

## Handoff

Return changed behavior, evidence, and remaining blockers. Commit, push, PR creation, and deployment require the user's request; build alone does not request them.

Read [completion evidence](../references/completion.md) before reporting completion.
