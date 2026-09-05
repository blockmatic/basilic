# Architecture First

## Principle

Decide system boundaries, dependency direction, and deployment shape before local implementation choices harden into structural constraints.

## Statement

I treat architecture as the small set of decisions that are expensive to reverse: where responsibilities live, which dependencies point where, what crosses a process or trust boundary, and how the system is deployed. I do not design every class in advance. I make the consequential structure visible before the codebase makes it accidentally.

## Outcome

The system has an inspectable structural model at the level its scale requires. Components have named responsibilities and owners. Dependency direction, external systems, data stores, and deployment units are visible. Consequential choices have rationale and known tradeoffs. Implementation conforms, or the model is updated deliberately.

## Artifacts

- System context and container or component diagrams where they add value
- Architecture decision records for choices that are expensive to reverse
- Module boundaries and dependency rules enforced in code where practical
- Deployment topology and external dependency inventory
- Build-versus-buy decisions and structural constraints
- Ownership notes for major components and integrations

Do not diagram code an IDE can reveal. Show boundaries, relationships, and decisions a reader would otherwise have to reconstruct.

## Minimum Useful Artifact

For a small system, one page is enough:

- purpose and scope
- users and external systems
- deployable units and data stores
- labeled dependencies and their direction
- two or three consequential decisions, constraints, or unknowns

## Recipe

1. Inspect the repository layout, runtime entry points, deployment configuration, data stores, and external integrations.
2. Understand the product capabilities and quality attributes that constrain the structure.
3. Identify the boundaries already present in code and deployment, including accidental coupling and shared state.
4. Propose the smallest structural clarification or change. Prefer one boundary or decision over a complete redesign.
5. Record the rationale, alternatives, consequences, and trigger for reconsideration when the choice is consequential.
6. Implement with dependency direction visible and enforceable where the project supports it.
7. Validate the model against the running and deployed system, not only the directory tree.
8. Update diagrams and decision records when structure or deployment shape changes.

## Validation

- A new contributor can name the major parts, their responsibilities, and how they depend on one another.
- Diagrams match code and deployment, or discrepancies are named.
- New dependencies follow the intended direction.
- Consequential choices have rationale and tradeoffs, not only a technology name.
- The architecture is proportional to the product and its risks.

## Definition of Done

The structural decision is explicit, implemented, and validated. Boundaries and dependency direction are inspectable. Durable architecture artifacts match the system or record deliberate drift.

## Agent Prompt

Apply Architecture First to this repository.

Read product constraints, existing architecture notes and ADRs, repository structure, deployment configuration, data stores, and external integrations. Inspect the implementation and running topology; do not assume diagrams are current.

Identify the decisions that are expensive to reverse: system boundaries, dependency direction, shared state, deployment units, and external dependencies. Preserve intentional existing structure. Do not introduce services, layers, queues, or platforms merely because they are common elsewhere.

Propose the smallest useful structural change or artifact. Record rationale and tradeoffs for consequential choices. Validate the model against code and deployment. Update durable architecture artifacts when structure changes.

## Notes

**Architecture vs Product:** Product names the capability and constraints. Architecture assigns responsibilities and structural boundaries.

**Architecture vs Data:** Architecture places stores and data flows. Data owns canonical meaning, ownership, lifecycle, and evolution.

**Architecture vs API:** Architecture decides which components communicate. API defines the contract across a boundary.

**Architecture vs Pipelines:** Architecture describes deployment units and topology. Pipelines build, validate, and deliver them.

**Architecture vs Operations:** Architecture names the running parts. Operations observes and recovers them.

**Navigation:** [Human essay](../articles/ARCHITECTURE.md) · [Factory map](../ABOUT.md)
