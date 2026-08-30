---
name: plan-architecture
description: Produce a structured architectural plan with explicit goals, trade-offs, and visual diagrams. Use when the user types /plan-architecture.
disable-model-invocation: true
---

Produce a structured architectural plan with explicit goals, trade-offs, and visual diagrams. Use when designing new systems, refactoring architecture, or evaluating technical decisions. **User intent drives scope and focus**—adapt structure to what they ask for; ask questions when intent is unclear.

1. **Gather context**: Check readme, docs, codebase as reference—inform the plan but stay open to proposing changes that diverge from current state
2. **Define goals**: State clear objectives aligned with user intent; distinguish must-haves vs nice-to-haves
3. **List considerations**: Constraints, trade-offs, risks, alternatives—scope to what matters for the user’s question
4. **Create diagrams**: Use Mermaid (flowchart, sequence, C4, ER, etc.) to show structure, flows, boundaries—choose types and split diagrams based on intent
5. **Summarize assumptions**: Key bullets; flag deferrals for ambiguous or high-risk decisions
6. **Output**: Write to a markdown file—use path if user provided one, otherwise ask where to save; include goals, considerations, diagrams, assumptions; ## References only when rules/skills were used; offer to refine or expand

