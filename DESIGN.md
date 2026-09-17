# DESIGN.md

> Visual language for the Basilic demo shell. Token **values** live in [`packages/ui/src/styles/tokens.css`](packages/ui/src/styles/tokens.css). Do not invent a second palette. Do not generate this file from `tokens.css`.

## Product

**Basilic** is the demo shell brand (sidebar). Apps consume `@repo/ui` (shadcn/ui, Radix, Tailwind 4). App-only UI stays in `apps/web`, `apps/mobile`, and `apps/docu`. See [ADR 004](apps/docu/content/docs/adrs/004-design-system.mdx) and [Frontend](apps/docu/content/docs/architecture/frontend.mdx).

## Docs

`apps/docu` is not the demo shell. The home page is Persuade (fork-and-run); MDX pages are Read. Both use the same tokens, Inter / Poppins / Geist Mono, and the favicon **B** mark. Agent-agnostic copy: `AGENTS.md` is the contract; Cursor slash is an adapter. Fumadocs keeps its own docs chrome — do not describe it as sidebar + main.

## Color

Semantic tokens from `tokens.css` (`@theme inline`). Markets 24h change uses `text-chart-2` for up and `text-destructive` for down. No second chart or brand palette in the apps.

## Typography

Inter, Poppins, and a monospace stack, as named in `tokens.css`. Do not add a fourth family for the demo shell.

## Layout

Sidebar + main content. Radius and sidebar tokens come from the same file. Components: `@repo/ui/components/*`.

## Motion

No extra motion guidelines beyond the existing `emilkowal-animations` / `motion-v13` skills. Do not add a second design skill from `/ui`.

## Verification

Browser verification is a bounded desktop + mobile screenshot pass plus keyboard — not visual-regression CI.
