---
name: plan-architecture
description: Plan an implementation structure; durable architecture decisions belong in ADRs and architecture docs. Use when the user types /plan-architecture.
disable-model-invocation: true
---

## Purpose and inputs

Produce an implementation-structure plan for the user's question. Durable system decomposition belongs in existing ADRs and architecture MDX. Do not mint a second ADR tree.

## Steps

1. Read the matching architecture MDX and ADRs. If the change is a durable boundary, stop and document it in the existing ADR/docs system.
2. State implementation goals vs nice-to-haves. Stay inside the existing architecture unless the user already authorized a durable architecture decision.
3. List constraints, trade-offs, and alternatives that affect this change. Flag high-risk items for a human.
4. Add Mermaid only when structure or flow is otherwise unclear.
5. Save only if the user gave a path; otherwise return in chat. Include assumptions and References. Do not create a branch.

## Verification

- [ ] The plan does not replace architecture MDX or invent an ADR location.
- [ ] Assumptions and deferrals are explicit.
- [ ] Commands and generated-source owners come from inspected docs.

## Handoff

Return the plan location or chat body and whether an ADR or architecture-doc update is still required.
