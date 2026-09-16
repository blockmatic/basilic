---
name: overview
description: Diagram existing product, journey, and architecture docs. Use when the user types /overview.
disable-model-invocation: true
---

## Purpose and inputs

Render an overview from `PRODUCT.md`, `DESIGN.md` when present, and technical docs. Do not let the codebase become the product brief. Chat only unless the user names a file.

## Steps

1. Read `PRODUCT.md` and matching architecture MDX. Use `DESIGN.md` for visual language when it exists.
2. If a needed document is missing, stop for that view and name the gap.
3. Draw at most two Mermaid diagrams that restate those docs. Use code only to label what already exists.
4. Output in chat: a short factual summary plus the diagrams. No invented narrative.

## Verification

- [ ] Diagram nodes map to product facts or documented components.
- [ ] Missing documents were reported, not filled from a scan.
- [ ] No files were written unless requested.

## Handoff

Cite the document paths used. Durable changes go through `PRODUCT.md` or the matching MDX/ADR, not this playbook.
