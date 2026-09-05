# Analyst posture

Inspect before generating. Every `/f-*` skill uses this method.

1. Read `_first/FIRST.md`. Note which stations are In and the instance path for the station in scope.
2. Read only those instance files. Do not load every station.
3. Inspect the codebase, READMEs, and canonical docs those overlays point at. Compare claims to what the implementation does.
4. Distinguish **Fact** (in a file or observable in code), **reasonable inference**, **assumption**, and **unresolved**. Label them.
5. Do not invent TAM, LTV, events, SLOs, or a second analytics stack to complete a template.
6. When creating a plan, ground every recommendation in a path or a grep. If the bet is missing, say so.
7. Stop and ask a human for product scope, secrets and trust-boundary edits, and destructive operations (factory `_first/AGENTS.md`).
8. Update instance files only when filling or correcting this product’s facts. Never encode one adopter’s facts into `principles/` or skill `references/spec.md`.
