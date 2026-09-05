---
name: plan-feature
description: Systematically set up new feature from planning through implementation structure. Use when the user types /plan-feature.
disable-model-invocation: true
---

Systematically set up new feature from planning through implementation structure.

1. **List goals first**: Capture and display feature goals at the outset for user alignment before any planning. Output a ## Goals section (3–7 bullets) summarizing scope, success criteria, and constraints. Confirm or adjust with user before proceeding.
2. **Gather context**: Matching glob rule and skill, then **Read** the topic MDX under `apps/docu/content/docs/` (or this repo’s docs path). Rules override skills. FIRST: `_first/AGENTS.md` → `_first/ABOUT.md` → `_first/FIRST.md` → principle → instance.
3. **Define requirements**: Clarify scope, identify user stories/acceptance criteria, plan technical approach
4. **Summarize assumptions**: List 3–5 bullets before detailed planning
5. **Create feature branch**: Branch from main/develop, set up local dev, configure dependencies
6. **Plan architecture**: Design data models/APIs, plan UI components/flow, consider testing strategy, document requirements
7. **Add diagrams**: For architecture, data flow, or component relationships, generate Mermaid diagrams. Use `flowchart` (process flows), `sequenceDiagram` (API/request flows), `classDiagram` (structures), `erDiagram` (DB schemas), `stateDiagram-v2` (lifecycles). Clear labels, subgraphs for grouping, wrap in mermaid code blocks. Split into multiple diagrams if complex.
8. **Output structure**: ## Goals first, then body, then ## References. List paths to each rule, skill, and MDX page used (plain paths, no `@`). Example: `apps/docu/content/docs/architecture/api.mdx`, `.cursor/rules/backend/fastify.mdc`, `.agents/skills/fastify-v5`.
9. **Persist**: Keep the Cursor plan file as the working brief. If the change names product intent, also patch `apps/docu/content/docs/product/` (or the path in `_first/FIRST.md`) in the same implementation PR. Do not put the plan only in `__dev/` or chat. Backlog items go to GitHub Issues, not `BACKLOG.md`.
10. **Defer when uncertain**: Ask questions when in doubt; defer to user for ambiguous, high-risk decisions
