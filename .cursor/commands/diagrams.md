# Generate Mermaid Diagram

## Overview
Analyze provided code, architecture, or concept and generate clear, well-structured Mermaid diagram visualizing relationships, flow, or structure.

## Instructions
1. **Analyze the input** - Understand what user wants to visualize (code flow, architecture, data relationships, state machines, sequences, etc)
2. **Choose appropriate diagram type**: `flowchart` (process flows/decision trees/algorithms), `sequenceDiagram` (API calls/message passing/request-response flows), `classDiagram` (class structures/inheritance/interfaces), `erDiagram` (database schemas/entity relationships), `stateDiagram-v2` (state machines/lifecycle flows), `graph TD/LR` (dependency graphs/module relationships), `gitgraph` (git branching strategies), `journey` (user journeys), `gantt` (timelines/schedules)
3. **Generate diagram** with: Clear descriptive node labels, logical grouping with subgraphs where appropriate, consistent styling/direction, meaningful relationship labels on edges, not overly complex - split into multiple diagrams if needed
4. **Output format**: Always wrap diagram in mermaid code block

## Diagram Style Guidelines
- Use descriptive IDs: `userService` not `a1`
- Add labels to relationships when they add clarity
- Use subgraphs to group related components
- Keep diagrams readable - max ~15-20 nodes per diagram
- Use appropriate arrow styles: `-->` solid arrow (main flow), `-.->` dotted arrow (optional/async), `==>` thick arrow (important path), `o-->` circle end (aggregation), `*-->` diamond end (composition)

## Examples
See original file for flowchart, sequence diagram, class diagram, and ER diagram examples.

## After generating
- Explain what diagram shows
- Offer to refine or expand specific sections
- Suggest alternative diagram types if applicable
