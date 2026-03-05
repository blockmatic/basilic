Systematically set up new feature from planning through implementation structure. Follow architecture, strategies, and decisions in `@apps/docu/`. Follow @.cursor/rules/base/general.mdc for planning discipline.

1. **List goals first**: Capture and display feature goals at the outset for user alignment before any planning. Output a ## Goals section (3–7 bullets) summarizing scope, success criteria, and constraints. Confirm or adjust with user before proceeding.
2. **Gather context**: Read readme, docs, skills, rules before planning and coding. Follow Cursor rules from .cursor/rules/ as the source of truth for project standards, architecture decisions, and coding conventions — these take precedence over skills.
3. **Define requirements**: Clarify scope, identify user stories/acceptance criteria, plan technical approach
4. **Summarize assumptions**: List 3–5 bullets before detailed planning
5. **Create feature branch**: Branch from main/develop, set up local dev, configure dependencies
6. **Plan architecture**: Design data models/APIs, plan UI components/flow, consider testing strategy, document requirements
7. **Add diagrams**: For architecture, data flow, or component relationships, generate Mermaid diagrams. Use `flowchart` (process flows), `sequenceDiagram` (API/request flows), `classDiagram` (structures), `erDiagram` (DB schemas), `stateDiagram-v2` (lifecycles). Clear labels, subgraphs for grouping, wrap in mermaid code blocks. Split into multiple diagrams if complex.
8. **Output structure**: Ensure ## Goals first, ## References (cursor rules and skills used), diagrams where they clarify architecture/flow. The ## References section must include explicit @-style cross-references to each rule/skill document used (e.g. @.cursor/rules/cursor/rules.mdc, @.cursor/rules/cursor/skills.mdc, @.cursor/rules/base/docs.mdc or other applicable paths). Verify cross-references use @ syntax correctly so outputs are auditable and consistent.
9. **Defer when uncertain**: Ask questions when in doubt; defer to user for ambiguous, high-risk decisions
