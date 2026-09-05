---
name: b-council
description: Explore a codebase with parallel agents, then hand off findings. Use when the user types /b-council.
disable-model-invocation: true
---

## Purpose and inputs

Gather architecture and keywords for the requested area, then spawn a small set of varied explorers. This playbook inspects. It does not commit, push, or open a PR. Implementation continues only when the user already asked for it.

## Steps

1. Inspect the area yourself first: owning packages, README/scripts, and current behavior. Record keywords and the architecture sketch the agents will use.
2. Spawn explorers only as needed. Default to 3; the user may raise the count. Cap at 6 unless they name a higher number. Give each a distinct angle; include one out-of-the-box probe.
3. Reconcile reports against the tree. Prefer file evidence over agent summaries. If the working tree changed underfoot, re-verify before using a finding.
4. If the user asked only to investigate or plan, hand off. If they also asked to implement, follow [b-build](../b-build/SKILL.md) after the inspection — do not publish.

## Verification

- [ ] Findings cite paths that still exist.
- [ ] No Git publish happened from this playbook.
- [ ] Implementation, if any, was already authorized by the user.

## Handoff

Return a short evidence list, contradictions, and the next named playbook (`/b-plan-feature`, `/b-build`, or stop). For plans, include References, 3–5 assumptions, and deferrals per [b-plan-feature](../b-plan-feature/SKILL.md).
