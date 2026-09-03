# Journeys First

## Principle

Map how someone finishes a job — including errors, permissions, and state — before implementation invents the path from whichever screen shipped first.

## Statement

The product is not a collection of screens. It is someone trying to finish a job. I map that job from entry to completion before I trust implementation to fill in the gaps. Happy paths are cheap. The product breaks in the alternates: the error nobody designed, the permission that exists on one route but not another, the state with no exit.

## Outcome

Actors, entry points, happy paths, alternates, error paths, permission gates, and completion criteria are documented or explicitly marked unknown. Missing states are visible before code hardens around an incomplete model.

## Artifacts

- Journey documents or flow descriptions
- State diagrams for multi-step flows
- Actor definitions (human, admin, agent, system)
- Acceptance criteria tied to completion
- Permission and error matrices for critical flows

## Minimum Useful Artifact

- actor, job, entry point, and preconditions
- happy path from entry to completion
- important alternate, error, cancel, and recovery paths
- permission gates that reference Security-owned policy
- completion criteria and explicit deferrals

## Recipe

1. Inspect product goals, existing routes, screens, API flows, and auth rules.
2. Understand the actor and the job they are trying to finish — not the screen, the outcome.
3. Identify gaps: missing error exits, permission drift across entry points, states with no resume.
4. Propose the smallest useful map: one job, its entries, its gates, its completion.
5. Write happy path, then alternates, then errors, then permission gates.
6. Compare the map to implementation. Flag missing or contradictory states.
7. Validate that a reviewer can trace every mapped state to implemented behavior or an explicit deferral.
8. Update journey artifacts when flow behavior changes.

## Validation

- Every critical flow has defined error and recovery behavior.
- Permission checks are consistent across entry points.
- Every mapped state traces to implemented behavior or an explicit deferral; accidental gaps fail validation.

## Definition of Done

Critical flows are mapped with happy, alternate, and error paths documented or explicitly deferred. Implementation matches the map, or the map was updated to reflect a deliberate change.

## Agent Prompt

Apply Journeys First to this repository.

Read product documentation, journey artifacts if they exist, and the current implementation of user-facing flows. Map actors, entry points, states, permissions, errors, and completion criteria. Compare documentation to actual behavior.

Do not invent UI. Describe what happens and why. Surface missing states and edge cases before implementing. Preserve intentional existing flow decisions. Propose the smallest useful update to journey artifacts. Update durable project files when flow behavior changes.

Treat agents in the product as actors in the flow. If an actor is unnamed, do not invent a tool for them.

## Notes

**Journeys vs Product:** Product answers what and why. Journeys answer how someone finishes.

**Journeys vs Design:** Journeys describe behavior and flow. Design describes how that behavior is expressed through the interface.

**Journeys vs Security:** Journeys show where a permission gate occurs and what the actor experiences. Security owns the permission policy.

**Journeys vs Data:** Journeys describe actor-visible states and transitions. Data owns the canonical meaning and lifecycle of persisted state.

**Navigation:** [Human essay](../articles/JOURNEYS.md) · [Factory map](../ABOUT.md)
