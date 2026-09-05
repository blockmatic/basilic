---
name: diagrams
description: Analyze provided code, architecture, or concept and generate clear, well-structured Mermaid diagram visualizing relationships, flow, or structure. Use when the user types /diagrams.
disable-model-invocation: true
---

## Purpose

Analyze provided code, architecture, or concept and generate clear, well-structured Mermaid diagram visualizing relationships, flow, or structure.

## Steps

1. **Analyze the input**: Understand what user wants to visualize (code flow, architecture, data relationships, state machines, sequences, etc)
2. **Choose appropriate diagram type**: `flowchart` (process flows/decision trees/algorithms), `sequenceDiagram` (API calls/message passing/request-response flows), `classDiagram` (class structures/inheritance/interfaces), `erDiagram` (database schemas/entity relationships), `stateDiagram-v2` (state machines/lifecycle flows), `graph TD` or `graph LR` (dependency graphs/module relationships), `gitgraph` (git branching strategies), `journey` (user journeys), `gantt` (timelines/schedules)
3. **Generate diagram**: Create with clear descriptive node labels, logical grouping with subgraphs where appropriate, consistent styling/direction, meaningful relationship labels on edges, not overly complex - split into multiple diagrams if needed
4. **Output and explain**: Always wrap diagram in mermaid code block, explain what diagram shows, offer to refine or expand specific sections, suggest alternative diagram types if applicable

## Completion

Read [completion evidence](../references/completion.md) before reporting completion.
