# Journeys First

## Principle

Map how someone finishes a job — including errors, permissions, state, and how the interface expresses it — before implementation invents the path from whichever screen shipped first.

## Statement

The product is not a collection of screens. It is someone trying to finish a job. I map that job from entry to completion before I trust implementation to fill in the gaps. Happy paths are cheap. The product breaks in the alternates: the error nobody designed, the permission that exists on one route but not another, the state with no exit. How those states communicate — copy, motion, tokens, primitives — is the same station, not a later polish pass.

## Outcome

Actors, entry points, happy paths, alternates, error paths, permission gates, and completion criteria are documented or explicitly marked unknown. Missing states are visible before code hardens around an incomplete model. The interface follows a coherent system: tokens, primitives, composition rules, and content patterns. Loading, empty, error, success, and disabled states are defined. New UI reuses established patterns. Browser verification across states is the bar.

## Artifacts

- Journey documents or flow descriptions
- State diagrams for multi-step flows
- Actor definitions (human, admin, agent, system)
- Acceptance criteria tied to completion
- Permission and error matrices for critical flows
- `DESIGN.md` when Journeys includes a visual identity file — [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md) (Google Labs, alpha): optional YAML frontmatter (tokens) plus markdown rationale. Tokens are the values; prose is how to apply them. Parallel to OpenAPI versus API First.
- Design system in code: CSS variables, Tailwind `@theme`, component library
- Interaction specifications, content patterns, and motion guidelines
- Accessibility requirements beyond token contrast

Prefer `_first/DESIGN.md` so the file lives in the user pack. Point `FIRST.md` at that one file as a Journeys artifact, not as a station. A root `DESIGN.md` only if existing tooling requires it. Never two palettes.

If `DESIGN.md` exists: YAML tokens are the values to use; markdown do's and don'ts are constraints. Follow the spec’s `##` order when those sections apply. Omit unused visual sections with YAML `omitted` and a reason. Unknown headings are preserved; use them for interface states, copy, motion, and accessibility beyond contrast. Do not fork a competing schema.

Token groups may follow W3C Design Tokens (DTCG) conceptually. Use the project's pinned lint command, or `npx @google/design.md lint _first/DESIGN.md` (explicit path) when the CLI is already part of the toolchain. A zero exit code is not an accessibility pass or browser verification.

Do not keep a palette in `DESIGN.md` and a different one in CSS.

## Minimum Useful Artifact

- actor, job, entry point, and preconditions
- happy path from entry to completion
- important alternate, error, cancel, and recovery paths
- permission gates that reference Security-owned policy
- completion criteria and explicit deferrals
- user goal and required interface states
- existing tokens, primitives, and patterns to reuse
- keyboard, contrast, focus, and reduced-motion constraints
- browser views or notes showing how the states were verified

## Recipe

1. Inspect product goals, existing routes, screens, API flows, auth rules, `DESIGN.md` if present, tokens in code, and the component library.
2. Understand the actor and the job they are trying to finish — not the screen, the outcome. Name the interface states that job needs: default, loading, empty, error, success, disabled.
3. Identify gaps: missing error exits, permission drift across entry points, states with no resume, values outside the system, DESIGN.md/code drift.
4. Propose the smallest useful map: one job, its entries, its gates, its completion, primitives from the existing system.
5. Write happy path, then alternates, then errors, then permission gates. Define interaction. Add motion only where it improves feedback.
6. Compare the map to implementation. Flag missing or contradictory states. Do not introduce hex values or typefaces outside the system.
7. Validate that a reviewer can trace every mapped state to implemented behavior or an explicit deferral. Validate in the browser across states, keyboard, and reduced motion. Lint DESIGN.md if the project has the CLI.
8. Update journey and design artifacts when flow or interface behavior changes.

## Validation

- Every critical flow has defined error and recovery behavior.
- Permission checks are consistent across entry points.
- Every mapped state traces to implemented behavior or an explicit deferral; accidental gaps fail validation.
- New UI uses existing tokens and components unless a gap is documented.
- `DESIGN.md` and the implementation agree, or the discrepancy is named.
- Motion respects `prefers-reduced-motion`.
- A green DESIGN.md lint is not browser verification.

## Definition of Done

Critical flows are mapped with happy, alternate, and error paths documented or explicitly deferred. Interface behavior matches intent. States are handled. Implementation matches the map, or the map was updated to reflect a deliberate change.

## Agent Prompt

Apply Journeys First to this repository.

Read product documentation, journey artifacts if they exist, `DESIGN.md` if it exists, and the current implementation of user-facing flows. Map actors, entry points, states, permissions, errors, completion criteria, and how those states are expressed. Compare documentation to actual behavior. Treat YAML tokens as the values to use and markdown do's and don'ts as constraints.

Do not invent a second product language. Describe what happens and why, then reuse established primitives. Surface missing states and edge cases before implementing. Preserve intentional existing flow and interface decisions. If tokens live in CSS or Tailwind and `DESIGN.md` disagrees or is absent, do not silently create a second palette.

Treat agents in the product as actors in the flow. If an actor is unnamed, do not invent a tool for them. Validate in the browser across states. A screenshot of the default view is not verification. Update durable project files when flow or interface behavior changes.

## Notes

**Journeys vs Product:** Product answers what and why. Journeys answer how someone finishes and how that job is expressed.

**Journeys vs Security:** Journeys show where a permission gate occurs and what the actor experiences. Security owns the permission policy.

**Journeys vs Data:** Journeys describe actor-visible states and transitions, including conversational resume. Data owns the canonical meaning and lifecycle of persisted state, including the memory store.

**Journeys vs API:** API is the capability boundary. Journeys is the human-visible expression of the job. `DESIGN.md` is an artifact, not a station — parallel to OpenAPI versus API First.

**Navigation:** [Human essay](../articles/JOURNEYS.md) · [Factory map](../ABOUT.md)
