---
name: info-architecture
description: Propose mechanical file and doc reorg; durable topology belongs in docs MDX. Use when the user types /info-architecture.
disable-model-invocation: true
---

## Purpose and inputs

Improve discoverability of files and docs without discarding information. Durable documentation topology belongs in existing docs MDX and file-organization rules. Ask before renaming or moving trees.

## Steps

1. Map the current layout against repository file-organization rules and docs MDX. If the change is durable IA, update those docs in the same work after confirmation.
2. Propose groupings, kebab-case names, and shallower trees. Do not invent a second docs hierarchy.
3. Show the proposed moves. Apply only after the user confirms destructive renames.
4. Update imports and cross-references in the same work. Preserve unrelated files.

## Verification

- [ ] Proposed moves follow existing file-organization rules.
- [ ] User confirmed before bulk rename/move.
- [ ] Affected imports or doc links were updated.

## Handoff

Return the proposal or the applied moves. Durable IA decisions still belong in the existing docs, not a second hierarchy.
