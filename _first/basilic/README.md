# Basilic instances

Operational specs for applying FIRST in this monorepo. Not a second factory. Durable facts live in `apps/docu/content/docs/`, ADRs, TypeBox routes, OpenAPI (generated), and package READMEs.

This folder is this repository’s adoption pack. When copying FIRST into another repo, copy only `ABOUT.md` and `principles/` — skip this directory.

## Load order

1. [`../AGENTS.md`](../AGENTS.md)
2. [`../ABOUT.md`](../ABOUT.md)
3. Repo instructions ([`../../AGENTS.md`](../../AGENTS.md), `.cursor/rules`, `.agents/skills`) — these override generic FIRST
4. [`../principles/X.md`](../principles/API.md) then `X.md` in this folder

Do not install a FIRST skill. Use existing tech and workflow skills.

## Discovery loop

1. Name one primary station. Load a secondary spec only if the change crosses that station’s boundary.
2. Read the generic spec, then this instance.
3. Inspect implementation and `apps/docu`. Distinguish facts, inferences, assumptions, questions.
4. Propose the smallest useful update: portable factory wording, this instance, or a durable project file.
5. Implement against that contract.
6. Validate with this repo’s checks (`pnpm qa`, OpenAPI drift, targeted tests). Run `python3 _first/scripts/validate_docs.py` only when generic FIRST files changed.
7. Update this instance if a real path or check was learned. Update `../principles/X.md` only if the portable recipe was wrong.

## Format sync

When `../principles/` headings change, update every station file here in the same session. Do not teach this folder to `../scripts/validate_docs.py`.

Required `##` headings (copy of `principleHeadings`):

`Principle` · `Statement` · `Outcome` · `Artifacts` · `Minimum Useful Artifact` · `Recipe` · `Validation` · `Definition of Done` · `Agent Prompt` · `Notes`

Filenames match the twelve stations in order: PRODUCT, JOURNEYS, DESIGN, ARCHITECTURE, DATA, API, DOCUMENTATION, WORKFLOW, PIPELINES, QUALITY, SECURITY, OPERATIONS.

## Link convention

From a station file in this folder:

- Generic spec: `../principles/X.md`
- Essay: `../articles/X.md`
- Factory map: `../ABOUT.md`
- Docs: `../../apps/docu/content/docs/…`
- Repo root: `../../README.md`

## Stations

| # | Station | Instance |
|---:|---|---|
| 1 | Product | [PRODUCT.md](PRODUCT.md) |
| 2 | Journeys | [JOURNEYS.md](JOURNEYS.md) |
| 3 | Design | [DESIGN.md](DESIGN.md) |
| 4 | Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 5 | Data | [DATA.md](DATA.md) |
| 6 | API | [API.md](API.md) |
| 7 | Documentation | [DOCUMENTATION.md](DOCUMENTATION.md) |
| 8 | Workflow | [WORKFLOW.md](WORKFLOW.md) |
| 9 | Pipelines | [PIPELINES.md](PIPELINES.md) |
| 10 | Quality | [QUALITY.md](QUALITY.md) |
| 11 | Security | [SECURITY.md](SECURITY.md) |
| 12 | Operations | [OPERATIONS.md](OPERATIONS.md) |

Do not invent TAM, event taxonomies, or SLOs to complete a template. Label **Fact**, **Drift**, and **Unresolved** under Artifacts.
