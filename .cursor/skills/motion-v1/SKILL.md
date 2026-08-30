---
name: motion-v1
description: React animations with Motion (gestures, scroll, layout, SVG). Use when drag-and-drop, scroll animations, modals, carousels, parallax, or AnimatePresence issues.
---

# Motion

Package: `motion` (formerly `framer-motion`). Import from `motion/react`, not `framer-motion`.

## When

Use for drag, scroll-linked, layout, gestures, shared-element transitions. Prefer CSS/`tw-animate-css` first (see @.cursor/rules/frontend/design.mdc).

## Install

`pnpm add motion` — import `{ motion, AnimatePresence } from "motion/react"`.

## Depth

- Corrections vs old Framer Motion APIs: [rules/motion.md](rules/motion.md)
- Patterns: [references/common-patterns.md](references/common-patterns.md)
- Next.js `'use client'`: [references/nextjs-integration.md](references/nextjs-integration.md)
- Perf: [references/performance-optimization.md](references/performance-optimization.md)
