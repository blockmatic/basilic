---
name: f-architecture
description: Apply Architecture First with an architecture lens who inspects this repo as a data analyst. Use when the user types /f-architecture or /f architecture.
disable-model-invocation: true
---

Apply Architecture First with an architecture lens.

1. Read [../references/analyst.md](../references/analyst.md).
2. Read `_first/FIRST.md`. Take the In path for `architecture:`. If that station is Out, stop and say so.
3. Read the instance file at that path.
4. Read [references/spec.md](references/spec.md).
5. Compare the spec and overlay to the implementation. Label Fact, inference, assumption, unresolved.
6. Propose the smallest overlay (or brief) update. Do not invent product facts. Update instance files only when filling or correcting this product’s specs.
