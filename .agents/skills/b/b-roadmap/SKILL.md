---
name: b-roadmap
description: Diff the codebase against existing PRODUCT horizons; do not invent a backlog. Use when the user types /b-roadmap.
disable-model-invocation: true
---

## Purpose and inputs

Compare implementation to the repository's product overlay (`_first/.../PRODUCT.md` or equivalent). Durable goals, priorities, and horizons belong to `/f-product`. Chat only unless the user names a file.

## Steps

1. Load FIRST in the repository's order and read the product overlay. If it is missing, stop and point at `/f-product`.
2. Diff code against named horizons and the feature map. List shipped, in-progress, and overlay items with no matching code.
3. Do not invent features, effort buckets, or a second backlog. Optional diagrams may illustrate the overlay, not a new roadmap.
4. Ask whether the user wants `/f-product` (durable change) or `/b-plan-feature` (implementation slices for an already-authorized item).

## Verification

- [ ] Every listed item cites PRODUCT.md or an existing issue/PR.
- [ ] No new priorities were minted from a codebase scan.
- [ ] No files were written unless requested.

## Handoff

Return overlay gaps and the owning station. Do not offer a feature plan unless the user asked.
