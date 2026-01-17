# Overview: Visual Architecture Diagram

Generate two Mermaid diagrams to overview the product. Track progress with todos.

## Todo List

Create these todos with `todo_write` and update as you go:

1. Scan and explore codebase structure, entry points, components
2. Create high-level user journey diagram
3. Create architecture diagram overviewing detailed technical flow

## Diagram 1: User Journey

A glanceable overview anyone can understand in 5 seconds.

- 5-7 nodes max, action verbs ("User uploads file" not "FileService")
- `flowchart LR` with subgraphs to group related steps
- Colors: warm neutrals (#F7F7F4), accent orange (#F34F1D) sparingly for key outcomes

```mermaid
flowchart LR
    subgraph Input["Input"]
        A[User Action]
    end
    subgraph Process["Process"]
        B[Transform]
    end
    subgraph Output["Output"]
        C[Outcome]
    end
    A --> B --> C
    style A fill:#F7F7F4,stroke:#D4D4D0
    style B fill:#EAEBE7,stroke:#C9C9C5
    style C fill:#FEF0ED,stroke:#F34F1D
```

## Diagram 2: Architecture Flow

Technical view for developers showing how data flows through the system.

- Use `sequenceDiagram` to show temporal flow between components
- 4-6 participants max, grouped logically
- Show request/response patterns with arrows (`->>` for requests, `-->>` for responses)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant S as Service

    U->>C: action
    C->>A: request
    A->>S: process
    S-->>A: result
    A-->>C: response
    C-->>U: update
```

## Output

Render directly in chat (don't write files):
1. 2-paragraph product description
2. User journey diagram
3. Architecture diagram

## Mermaid Syntax

- Subgraphs: `subgraph ID["Name"]`
- Special chars need quotes: `A["@scope/pkg"]`, `K["POST /api/foo"]`
- Sequence arrows: `->>` (request), `-->>` (response), `-)` (async)
- Participant aliases: `participant U as User`
