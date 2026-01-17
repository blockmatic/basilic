# Roadmap: Feature & Improvement Suggestions

Analyze the codebase and generate a visual roadmap of potential features and improvements. Track progress with todos.

## Todo List

Create these todos with `todo_write` and update as you go:

1. Scan codebase architecture, patterns, and conventions
2. Identify feature gaps and improvement opportunities
3. Create timeline diagram (phased overview)
4. Create current vs proposed flowchart (integration points)
5. Ask user which features to plan

## Analysis Focus

Look for opportunities in these areas:

- Missing common patterns (auth, caching, error handling, logging)
- Performance optimization opportunities
- Developer experience improvements
- User-facing feature enhancements
- Code quality / refactoring candidates

## Diagram 1: Timeline Overview

A phased roadmap showing features by effort level.

- 3 sections: Quick Wins, Medium Effort, Strategic
- Group related features within each phase
- Colors: warm neutrals with themed variables

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#F7F7F4',
  'primaryBorderColor': '#D4D4D0',
  'primaryTextColor': '#333',
  'secondaryColor': '#EAEBE7',
  'tertiaryColor': '#FEF0ED'
}}}%%
timeline
    title Feature Roadmap
    section Quick Wins
        Feature A : Low effort, high impact
        Feature B : Simple addition
    section Medium Effort
        Feature C : Requires some refactoring
    section Strategic
        Feature D : Architectural change
```

## Diagram 2: Current vs Proposed Flowchart

Visual distinction between existing and suggested features.

- Solid borders (#F7F7F4, #D4D4D0): existing features
- Dashed orange borders (#FEF0ED, #F34F1D): proposed features
- Solid arrows: direct dependencies
- Dashed arrows: suggested connections

```mermaid
flowchart TB
    subgraph Current["Current Features"]
        direction LR
        A[Existing A]
        B[Existing B]
    end
    subgraph Proposed["Proposed Features"]
        direction LR
        C[Suggested A]
        D[Suggested B]
    end

    A --> C
    B -.-> D

    style A fill:#F7F7F4,stroke:#D4D4D0
    style B fill:#F7F7F4,stroke:#D4D4D0
    style C fill:#FEF0ED,stroke:#F34F1D,stroke-dasharray:5 5
    style D fill:#FEF0ED,stroke:#F34F1D,stroke-dasharray:5 5
```

## Output

Render directly in chat (don't write files):
1. Brief assessment of current codebase state
2. Prioritized feature list (5-8 items with rationale)
3. Timeline diagram (phased overview)
4. Current vs Proposed flowchart (integration points)
5. Ask: "Would you like me to create a plan for any of these features?"

## Mermaid Syntax

- Timeline sections: `section Name`
- Subgraphs: `subgraph ID["Name"]`
- Dashed lines: `A -.-> B`
- Dashed borders: `stroke-dasharray:5 5`
- Special chars need quotes: `A["@scope/pkg"]`
