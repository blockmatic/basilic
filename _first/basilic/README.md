# Basilic instances

Operational specs for applying FIRST in this monorepo. Not a second factory. Product intent lives in [PRODUCT.md](PRODUCT.md). Technical facts live in `apps/docu/content/docs/` (architecture, ADRs, how-to), TypeBox routes, OpenAPI (generated), and package READMEs. `apps/docu` is not a product site.

This folder is this repository’s adoption pack. Factory source: [`blockmatic/first`](https://github.com/blockmatic/first). Skip this directory when copying FIRST elsewhere. Copy `README.md`, `ABOUT.md`, `AGENTS.md`, and `templates/` into `_first/`. Add `FIRST.md`. Install `npx skills add blockmatic/first`. Do not copy this folder.

## Load order

1. [`../AGENTS.md`](../AGENTS.md)
2. [`../ABOUT.md`](../ABOUT.md)
3. [`../FIRST.md`](../FIRST.md)
4. Repo instructions ([`../../AGENTS.md`](../../AGENTS.md), `.cursor/rules`, `.agents/skills`) — these override generic FIRST
5. Installed `/f-<station>` then `X.md` in this folder

Use `/f-*` for the operational spec. Essays live on the FIRST site.

## Discovery loop

1. Name one primary station. Load a secondary spec only if the change crosses that station’s boundary.
2. Read the generic spec (`/f-*`), then this instance.
3. Inspect implementation and `apps/docu`. Distinguish facts, inferences, assumptions, questions.
4. Propose the smallest useful update: portable factory wording, this instance, or a durable project file.
5. Implement against that contract.
6. Validate with this repo’s checks (`pnpm qa`, OpenAPI drift, targeted tests). Factory wording is reviewed in `blockmatic/first` (`pnpm validate` there).
7. Update this instance if a real path or check was learned. Propose a change in `blockmatic/first` `principles/` or `skills/f/` only if the portable recipe was wrong.

## Format sync

When factory template headings change, update every station file here in the same session. Do not teach this folder to the factory validator in `blockmatic/first`.

Required overlay `##` headings:

`Principle` · `Artifacts` · `Minimum Useful Artifact` · `Notes`

Existing files in this folder may still carry the full factory spec headings until they are thinned. Product adds Brief, Feature map, and Roadmap after Notes.

Filenames match the twelve stations in order: PRODUCT, JOURNEYS, DESIGN, ARCHITECTURE, DATA, API, DOCUMENTATION, WORKFLOW, PIPELINES, QUALITY, SECURITY, OPERATIONS.

## Link convention

From a station file in this folder:

- Generic spec: `/f-*` (copy in [blockmatic/first principles](https://github.com/blockmatic/first/tree/main/_first/principles))
- Essay: `https://github.com/blockmatic/first/blob/main/_first/articles/X.md`
- Instance map: `../FIRST.md`
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

## Overlay as delta

Keep the required `##` headings. Fill Artifacts with pointers and facts. Do **not** paste the generic Recipe, Agent Prompt, or Statement from the `/f-*` spec. Product is the exception: [PRODUCT.md](PRODUCT.md) is overlay and canonical brief (Brief, Feature map, Roadmap after Notes). Other stations point at `apps/docu` for technical facts. `__dev/` is scratch until it graduates into docs or this overlay.
