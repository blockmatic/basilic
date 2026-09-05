# Design First

## Principle

Decide how the product behaves and communicates through its interface before layout and components become accidental consequences of implementation.

## Statement

Useful software is the floor. The product people remember is the one that feels clear, thoughtful, and enjoyable to use. I treat design as behavior, hierarchy, states, copy, and motion — not decoration bolted on at the end. Before I add a pattern, I look at what the project already has and reuse it. Invention is for when the problem actually needs it.

## Outcome

The interface follows a coherent design system: tokens, primitives, composition rules, and content patterns. Loading, empty, error, success, and disabled states are defined. New UI reuses established patterns. The agent-readable identity and the implementation agree, or the discrepancy is named. Browser verification across states is the bar.

## Artifacts

- `DESIGN.md` when Design is in — [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md) (Google Labs, alpha): optional YAML frontmatter (tokens) plus markdown rationale. Tokens are the values; prose is how to apply them.
- Design system in code: CSS variables, Tailwind `@theme`, component library
- UI conventions and component definitions
- Interaction specifications and interface state definitions
- Accessibility requirements beyond token contrast
- Content and copy patterns
- Motion guidelines (duration, easing, when to animate)

Prefer `_first/DESIGN.md` so the file lives in the user pack. Point `FIRST.md` at that one file. A root `DESIGN.md` only if existing tooling requires it. Never two palettes.

If `DESIGN.md` exists: YAML tokens are the values to use; markdown do's and don'ts are constraints. Follow the spec’s `##` order when those sections apply: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Omit unused visual sections with YAML `omitted` and a reason — do not invent a palette to complete the template. Unknown headings are preserved; use them for FIRST concerns the Google file does not own (interface states, copy, motion, accessibility beyond contrast). Do not fork a competing schema.

Token groups may follow W3C Design Tokens (DTCG) conceptually. Export to Tailwind `@theme` or `tokens.json` if the project already does. Use the project's pinned lint command, or `npx @google/design.md lint _first/DESIGN.md` (explicit path) when the CLI is already part of the toolchain. It reports broken token references and contrast warnings on component color pairs. A zero exit code is not an accessibility pass or browser verification.

Do not keep a palette in `DESIGN.md` and a different one in CSS.

## Minimum Useful Artifact

- user goal and required interface states
- existing tokens, primitives, and patterns to reuse
- interaction and content behavior for each state
- keyboard, contrast, focus, and reduced-motion constraints
- browser views or notes showing how the states were verified

## Recipe

1. Inspect `DESIGN.md` if present, tokens in code, the component library, and adjacent screens.
2. Understand the states the feature needs: default, loading, empty, error, success, disabled.
3. Identify gaps: missing states, values outside the system, DESIGN.md/code drift.
4. Propose primitives from the existing system. New components only when nothing fits.
5. Define interaction: click, submit, dismiss, navigate back. Add motion only where it improves feedback.
6. Implement with existing primitives. Do not introduce hex values or typefaces outside the system.
7. Validate in the browser across states, keyboard, and reduced motion. Lint DESIGN.md if the project has the CLI.
8. Update design artifacts if you introduced a pattern worth reusing.

## Validation

- New UI uses existing tokens and components unless a gap is documented.
- `DESIGN.md` and the implementation agree, or the discrepancy is named.
- All required states render and behave correctly.
- Motion respects `prefers-reduced-motion`.
- A green DESIGN.md lint is not browser verification.

## Definition of Done

Interface behavior matches design intent. States are handled. Patterns are reusable or documented. Tokens in the agent-readable file and in code are the same system.

## Agent Prompt

Apply Design First to this repository.

Read `DESIGN.md` if it exists, then design system documentation, UI conventions, journey flows, and existing components before building new interface. Inspect how similar features are implemented. Treat YAML tokens as the values to use and markdown do's and don'ts as constraints.

Reuse established primitives. Do not invent new components, hex values, or typefaces without checking the design system first. If tokens live in CSS or Tailwind and `DESIGN.md` disagrees or is absent, do not silently create a second palette.

Define loading, empty, error, and success states. Use motion for feedback, not decoration. Respect reduced motion. Validate in the browser across states. A screenshot of the default view is not verification. Update durable design artifacts when patterns change.

## Notes

**Design vs Journeys:** Journeys define what happens. Design defines how the interface expresses it.

**Design vs API:** API is the capability boundary. Design is the human-visible expression. `DESIGN.md` is an artifact, not the principle — parallel to OpenAPI versus API First.

**Navigation:** [Human essay](../articles/DESIGN.md) · [Factory map](../ABOUT.md)
