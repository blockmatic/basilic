# Design First

## Principle

Decide how the product behaves and communicates through its interface before layout and components become accidental consequences of implementation.

## Statement

Useful software is the floor. The product people remember is the one that feels clear, thoughtful, and enjoyable to use. I treat design as behavior, hierarchy, states, copy, and motion — not decoration bolted on at the end. Before I add a pattern, I look at what the project already has and reuse it. Invention is for when the problem actually needs it.

## Outcome

The interface follows a coherent design system: tokens, primitives, composition rules, and content patterns. Loading, empty, error, success, and disabled states are defined. New UI reuses established patterns. The agent-readable identity and the implementation agree, or the discrepancy is named. Browser verification across states is the bar.

## Artifacts

- **Fact:** Demo shell brand is **Basilic** (sidebar). Markets home uses `@repo/ui` + `tokens.css` (`text-chart-2` / `text-destructive` for 24h change). No second palette.
- **Fact:** No Google-format `_first/DESIGN.md` yet. Do not invent a second palette to complete the template. When added, use [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md) at `_first/DESIGN.md` (or one path listed in [../FIRST.md](../FIRST.md)).
- **Fact:** Tokens: [`../../packages/ui/src/styles/tokens.css`](../../packages/ui/src/styles/tokens.css) — semantic colors, sidebar, radius, `@theme inline`, Inter / Poppins / mono
- **Fact:** Components: `@repo/ui` (shadcn/ui, Radix, Tailwind 4). ADR [004](../../apps/docu/content/docs/adrs/004-design-system.mdx). Frontend: [frontend.mdx](../../apps/docu/content/docs/architecture/frontend.mdx)
- **Fact:** Apps consume `@repo/ui`; app-only UI collocated in `apps/web` / `apps/mobile` / `apps/docu`
- **Fact:** Skills: `shadcn-v3`, `tailwind-design-system-v4`, `frontend-design-v1`; playbook `/audit-accessibility`, `/use-shadcn`
- **Unresolved:** Google-format `_first/DESIGN.md`; motion guidelines; copy patterns beyond component defaults

## Minimum Useful Artifact

- user goal and states: per feature (default, loading, empty, error, success, disabled)
- reuse: `@repo/ui` + `tokens.css`
- interaction: follow adjacent screens; do not introduce hex or typefaces outside tokens
- a11y: keyboard, contrast, focus, `prefers-reduced-motion` via `/audit-accessibility`
- verification: browser across states — not a single default screenshot

## Recipe

1. Inspect ADR 004, frontend MDX, `packages/ui`, `tokens.css`, and adjacent screens. There is no Google-format `DESIGN.md`.
2. Understand required states for the feature.
3. Identify missing states or values outside the system.
4. Propose primitives from `@repo/ui`. New components only when nothing fits (`/use-shadcn`).
5. Define click, submit, dismiss, back. Motion only for feedback.
6. Implement with existing primitives. No parallel palette.
7. Validate in the browser across states, keyboard, and reduced motion.
8. Update `@repo/ui` or MDX if you introduced a reusable pattern; update this instance.

## Validation

- New UI uses existing tokens and `@repo/ui` unless a gap is documented.
- Tokens in CSS and usage agree. No second palette. Absent Google-format `DESIGN.md` is named, not silently filled.
- Required states render and behave.
- Motion respects `prefers-reduced-motion`.
- A screenshot of the default view is not verification.

## Definition of Done

Interface behavior matches design intent. States are handled. Patterns are reusable or documented. Tokens in CSS are the system of record until a Google-format `DESIGN.md` exists.

## Agent Prompt

Apply Design First to Basilic.

Read ADR 004, frontend MDX, `packages/ui`, and `packages/ui/src/styles/tokens.css` before building UI. There is no Google-format `DESIGN.md` — do not create a second palette.

Reuse `@repo/ui`. Do not invent components, hex values, or typefaces without checking the system. Define loading, empty, error, and success states. Validate in the browser across states. Update durable design artifacts when patterns change. Update this instance when paths change.

## Notes

**Design vs Journeys:** Journeys define what happens. Design defines how the interface expresses it.

**Design vs API:** API is the capability boundary. Design is the human-visible expression. `DESIGN.md` is an artifact, not the principle.

**Navigation:** [Generic spec](../principles/DESIGN.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/DESIGN.md) · [Factory map](../ABOUT.md) · [Frontend](../../apps/docu/content/docs/architecture/frontend.mdx) · [ADR 004](../../apps/docu/content/docs/adrs/004-design-system.mdx)
