---
name: overview
description: Generate two Mermaid diagrams to overview the product. Use when the user types /overview.
disable-model-invocation: true
---

Generate two Mermaid diagrams to overview the product. Track progress with todos.

1. **Scan and explore**: Scan and explore codebase structure, entry points, components
2. **Create user journey diagram**: Create high-level user journey diagram (5-7 nodes max, action verbs, `flowchart LR` with subgraphs, warm neutrals #F7F7F4, accent orange #F34F1D for key outcomes)
3. **Create architecture diagram**: Create architecture diagram overviewing detailed technical flow (use `sequenceDiagram` to show temporal flow between components, 4-6 participants max grouped logically, show request/response patterns)
4. **Output**: Render directly in chat (don't write files) - 2-paragraph product description, user journey diagram, architecture diagram

