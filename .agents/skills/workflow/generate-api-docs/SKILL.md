---
name: generate-api-docs
description: Refresh API docs from the owning schema source; never edit generated OpenAPI by hand. Use when the user types /generate-api-docs.
disable-model-invocation: true
---

## Purpose and inputs

Update API documentation from the source of truth (TypeBox/Fastify routes, or the repo's documented generator). Never edit generated OpenAPI, generated clients, or generated SQL directly.

## Steps

1. Read the API docs MDX and the generator README. Identify the owning source and the generate script in package.json.
2. Change the owning schema or route, not the generated artifact.
3. Run the documented generate command. Check drift scripts if the repo has them.
4. Update adopter MDX only for behavior that changed. Do not invent auth, rate-limit, or versioning policy.

## Verification

- [ ] Generated files were produced by the generator, not hand-edited.
- [ ] The generate or drift check was run.
- [ ] No unsolicited commit.

## Handoff

Report the source files, generator command, and remaining doc gaps.
