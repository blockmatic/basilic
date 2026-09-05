---
name: b-release-review
description: Advisory review of release impact, changelog, and template contracts. Use when the user types /b-release-review.
disable-model-invocation: true
---

Advisory only. Do not bump versions, merge a release PR, or use publish credentials.

## Steps

1. **Scope**: Diff against `main` (feature PR) or the previous `v*` tag (release PR). List payload paths (`apps/api|web|mobile`, `packages/`, `tools/`, `scripts/`, `.cursor/`, `.agents/`, generator).
2. **Title**: Suggest a conventional title (`feat`/`fix`/`perf` or `!` / `BREAKING CHANGE`). Flag `docs`/`chore`/`test`/`ci`/`style` when payload paths changed unless the body has `skip-release: true`.
3. **Contract**: Note generator CLI, template include/exclude, and docs snapshot impact. Generated trees must not gain the documentation app or the generator.
4. **Notes**: Draft user-facing changelog bullets and required adopter actions. Keep Release Please's deterministic changelog authoritative.
5. **Evidence**: Link tests, classification, and (on a release PR) scaffold acceptance. Stop if a human gate is missing (npm trusted publisher, GitHub App, who may merge).

## Completion

Read [completion evidence](../references/completion.md); return advisory findings without changing versions or publishing.
