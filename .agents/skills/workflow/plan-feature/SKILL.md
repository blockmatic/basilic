---
name: plan-feature
description: Plan a feature as ordered, verifiable slices without changing implementation. Use when the user types /plan-feature.
disable-model-invocation: true
---

## Purpose and inputs

Use the requested outcome, existing plan or issue, relevant implementation, rules, and technical docs. Planning alone does not authorize implementation or Git changes.

## Steps

1. State goals, non-goals, acceptance criteria, and 3–5 material assumptions. Resolve consequential ambiguity; continue with reversible details already covered by the request.
2. Inspect the affected packages, their README and scripts, and existing behavior. For durable decisions, load FIRST in the repository's prescribed order and use one primary station.
3. Divide work into the smallest complete user-visible slices. For each, name likely files, dependencies, an observable acceptance condition, and the existing command or manual check that proves it.
4. Put uncertain dependencies early. Include error paths, compatibility, generated sources, and recovery where relevant. Use a diagram only when relationships need one.
5. Save to the existing plan location or the user's chosen destination. Include Goals, Assumptions, ordered tasks, Risks/Open Questions, and References (rules, skills, docs). Do not create another backlog or overwrite another task's unfinished plan.

## Verification

- [ ] Each slice has a result a reviewer can observe and a concrete verification method.
- [ ] Dependencies and consequential unresolved decisions are explicit.
- [ ] Commands come from inspected scripts; generated outputs have an owning source.
- [ ] The plan is reviewable without reconstructing this conversation.

## Handoff

Return the plan location, unresolved decisions, and first implementable slice. If the user also requested implementation, continue within that authorization; otherwise finish with the plan. Do not create a branch or scaffold code just to plan.
