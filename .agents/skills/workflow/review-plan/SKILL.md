---
name: review-plan
description: Review the attached or in-context plan against the current plan contract. Use when the user types /review-plan.
disable-model-invocation: true
---

## Purpose and inputs

Use the attached or in-context plan, the matching implementation, and [plan-feature](../plan-feature/SKILL.md). Stay read-only. Do not create files, branches, or scaffolds.

## Steps

1. Confirm the plan states goals, 3–5 assumptions, References, and ordered slices. Flag missing deferrals for consequential or high-risk items.
2. For each slice, check that a reviewer can observe the result, that a concrete verification method is named, and that generated outputs name an owning source.
3. Compare the plan to current code and docs. Call out contradictions, invented commands, and slices that create a branch or scaffold just to plan.
4. Check dependency order: uncertain work and generated-source ownership come before dependents. Reject a second backlog or overwrite of another unfinished plan.
5. Reply in chat only: summary, gaps, suggested reorder, and questions. No time estimates.

## Verification

- [ ] Each slice has an observable acceptance condition and a named check.
- [ ] Generated sources and consequential unresolved decisions are explicit.
- [ ] The plan does not authorize Git changes or implementation by itself.

## Handoff

Return whether the plan is implementable as written, the first blocked slice, and what must change before `/build`. An inspection is not approval to implement.
