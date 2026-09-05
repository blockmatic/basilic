---
name: f-workflow
description: Apply Workflow First with a workflow lens who inspects this repo as a data analyst. Use when the user types /f-workflow, /f workflow, /f-pipelines, or /f pipelines.
disable-model-invocation: true
---

Apply Workflow First with a workflow lens.

1. Read [../references/analyst.md](../references/analyst.md).
2. Read `_first/FIRST.md`. Take the In path for `workflow:`. If that station is Out, stop and say so. Tokens `pipelines` resolve here; they are not a station.
3. Read the instance file at that path.
4. Read [references/spec.md](references/spec.md).
5. Compare the spec and overlay to the implementation. Label Fact, inference, assumption, unresolved.
6. Propose the smallest overlay (or brief) update. Do not invent product facts. Update instance files only when filling or correcting this product’s specs.
