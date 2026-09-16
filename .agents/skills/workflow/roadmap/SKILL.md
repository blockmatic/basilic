---
name: roadmap
description: Diff the codebase against existing PRODUCT horizons; do not invent a backlog. Use when the user types /roadmap.
disable-model-invocation: true
---

## Purpose and inputs

Compare implementation to the repository's `PRODUCT.md`. Durable goals, priorities, and horizons belong there. Chat only unless the user names a file.

## Steps

1. Read `PRODUCT.md`. If it is missing, stop and say so.
2. Diff code against named horizons and the feature map. List shipped, in-progress, and PRODUCT.md items with no matching code.
3. Do not invent features, effort buckets, or a second backlog. Optional diagrams may illustrate PRODUCT.md, not a new roadmap.
4. Ask whether the user wants a durable `PRODUCT.md` change or `/plan` (implementation slices for an already-authorized item).

## Verification

- [ ] Every listed item cites PRODUCT.md or an existing issue/PR.
- [ ] No new priorities were minted from a codebase scan.
- [ ] No files were written unless requested.

## Handoff

Return PRODUCT.md gaps and the owning document. Do not offer a feature plan unless the user asked.
