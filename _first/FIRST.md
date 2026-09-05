# FIRST

spec: 0.3-draft

This repository’s instance map. Other users of the framework should list only the stations they opted into. Absent files beat empty stubs. Do not copy `basilic/` out.

Durable product facts live in [basilic/PRODUCT.md](basilic/PRODUCT.md). That overlay is also the canonical brief (intent, feature map, roadmap). Other station files under `basilic/` are inspection overlays (Fact, Drift, Unresolved). `apps/docu` is technical documentation for starter adopters, not Basilic product intent. The factory lives in [`blockmatic/first`](https://github.com/blockmatic/first).

## In

- product: [basilic/PRODUCT.md](basilic/PRODUCT.md)
- journeys: [basilic/JOURNEYS.md](basilic/JOURNEYS.md) — no Google-format `DESIGN.md` yet; tokens in `packages/ui`. When added, it is a Journeys artifact ([DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md)), not a station
- architecture: [basilic/ARCHITECTURE.md](basilic/ARCHITECTURE.md)
- data: [basilic/DATA.md](basilic/DATA.md)
- api: [basilic/API.md](basilic/API.md)
- documentation: [basilic/DOCUMENTATION.md](basilic/DOCUMENTATION.md)
- workflow: [basilic/WORKFLOW.md](basilic/WORKFLOW.md)
- quality: [basilic/QUALITY.md](basilic/QUALITY.md)
- security: [basilic/SECURITY.md](basilic/SECURITY.md)
- operations: [basilic/OPERATIONS.md](basilic/OPERATIONS.md)

Optional `_first/DESIGN.md` is not a station and is not written yet. Tokens live in `packages/ui`. When added, use [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md).

## Out

None for this adopter. A typical adopter omits stations they do not instantiate (for example Operations before production).
