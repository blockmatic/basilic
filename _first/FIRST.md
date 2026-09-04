# FIRST

spec: 0.2-draft

This repository’s instance map. Other users of the framework should list only the stations they opted into. Absent files beat empty stubs. Do not copy `basilic/` out.

Durable product facts live in `apps/docu`. Station files under `basilic/` are inspection overlays (Fact, Drift, Unresolved), not a second docs site. The factory lives in [`blockmatic/first`](https://github.com/blockmatic/first).

## In

- product: [basilic/PRODUCT.md](basilic/PRODUCT.md)
- journeys: [basilic/JOURNEYS.md](basilic/JOURNEYS.md)
- design: [basilic/DESIGN.md](basilic/DESIGN.md) — no Google-format `DESIGN.md` yet; tokens in `packages/ui`. When added, use [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md)
- architecture: [basilic/ARCHITECTURE.md](basilic/ARCHITECTURE.md)
- data: [basilic/DATA.md](basilic/DATA.md)
- api: [basilic/API.md](basilic/API.md)
- documentation: [basilic/DOCUMENTATION.md](basilic/DOCUMENTATION.md)
- workflow: [basilic/WORKFLOW.md](basilic/WORKFLOW.md)
- pipelines: [basilic/PIPELINES.md](basilic/PIPELINES.md)
- quality: [basilic/QUALITY.md](basilic/QUALITY.md)
- security: [basilic/SECURITY.md](basilic/SECURITY.md)
- operations: [basilic/OPERATIONS.md](basilic/OPERATIONS.md)

## Out

None for this adopter. A typical adopter omits stations they do not instantiate (for example Design with no UI, Operations before production).
