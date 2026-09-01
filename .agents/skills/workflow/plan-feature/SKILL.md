---
name: plan-feature
description: Systematically set up new feature from planning through implementation structure. Use when the user types /plan-feature.
disable-model-invocation: true
---

Systematically set up new feature from planning through implementation structure.

1. **List goals first**: Capture and display feature goals at the outset for user alignment before any planning. Output a ## Goals section (3–7 bullets) summarizing scope, success criteria, and constraints. Confirm or adjust with user before proceeding.
2. **Gather context**: Matching glob rule and skill, then **Read** the topic MDX under `apps/docu/content/docs/`. Rules override skills.
3. **Define requirements**: Clarify scope, identify user stories/acceptance criteria, plan technical approach
4. **Summarize assumptions**: List 3–5 bullets before detailed planning
5. **Create feature branch**: Branch from main/develop, set up local dev, configure dependencies
6. **Plan architecture**: Design data models/APIs, plan UI components/flow, consider testing strategy, document requirements
7. **Add diagrams**: For architecture, data flow, or component relationships, generate Mermaid diagrams. Use `flowchart` (process flows), `sequenceDiagram` (API/request flows), `classDiagram` (structures), `erDiagram` (DB schemas), `stateDiagram-v2` (lifecycles). Clear labels, subgraphs for grouping, wrap in mermaid code blocks. Split into multiple diagrams if complex.
8. **Output structure**: ## Goals first, then body, then ## References. List paths to each rule, skill, and MDX page used (plain paths, no `@`). Example: `apps/docu/content/docs/architecture/api.mdx`, `.cursor/rules/backend/fastify.mdc`, `.agents/skills/fastify-v5`.
9. **Defer when uncertain**: Ask questions when in doubt; defer to user for ambiguous, high-risk decisions
