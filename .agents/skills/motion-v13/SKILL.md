---
name: motion-v13
description: React animations with Motion v13 (gestures, scroll, layout, SVG). Use when drag-and-drop, scroll animations, modals, carousels, parallax, or AnimatePresence issues.
---

# Motion

Package: `motion` ^13 (formerly `framer-motion`). Import from `motion/react`, not `framer-motion`.

Folder major tracks the npm `motion` package, not a skill-file revision. This repo may not list `motion` in `package.json` (CSS/`tw-animate-css` first); keep `motion-v13` so `pnpm add motion` stays aligned. Do not invent `-v1` for libraries that have an npm major.

## When

Use for drag, scroll-linked, layout, gestures, shared-element transitions. Prefer CSS/`tw-animate-css` first (see @.cursor/rules/frontend/design.mdc).

## Install

`pnpm add motion` — import `{ motion, AnimatePresence } from "motion/react"`.

Motion 13 dropped `@emotion/is-prop-valid` as an optional dependency. If styled `motion` components leak CSS-in-JS props to the DOM, inject `isValidProp` via `MotionConfig` or compose `motion.create(StyledDiv)`. See https://motion.dev/docs/react-upgrade-guide

## Depth

- Corrections vs old Framer Motion APIs: [rules/motion.md](rules/motion.md)
- Patterns: [references/common-patterns.md](references/common-patterns.md)
- Next.js `'use client'`: [references/nextjs-integration.md](references/nextjs-integration.md)
- Perf: [references/performance-optimization.md](references/performance-optimization.md)
