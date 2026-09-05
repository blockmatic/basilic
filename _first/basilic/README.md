# Basilic instances

Operational overlays for applying FIRST in this monorepo. Not a second factory. Product intent lives in [PRODUCT.md](PRODUCT.md). Technical facts live in `apps/docu/content/docs/` (architecture, ADRs, how-to), TypeBox routes, OpenAPI (generated), and package READMEs. `apps/docu` is not a product site.

This folder is this repository’s adoption pack. Factory source: [`blockmatic/first`](https://github.com/blockmatic/first). Skip this directory when copying FIRST elsewhere. Copy `README.md`, `ABOUT.md`, and `AGENTS.md` into `_first/`. Add `FIRST.md`. Write overlays only for stations listed as In. Install `npx skills add blockmatic/first`. Do not copy this folder.

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

Required overlay `##` headings (see [`../ABOUT.md`](../ABOUT.md)):

`Principle` · `Artifacts` · `Minimum Useful Artifact` · `Notes`

Product adds Brief, Feature map, and Roadmap after Notes. Do **not** paste Recipe, Statement, Outcome, Validation, Definition of Done, or Agent Prompt from the `/f-*` spec.

Filenames match the ten stations in order: PRODUCT, JOURNEYS, ARCHITECTURE, DATA, API, DOCUMENTATION, WORKFLOW, QUALITY, SECURITY, OPERATIONS.

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
| 3 | Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 4 | Data | [DATA.md](DATA.md) |
| 5 | API | [API.md](API.md) |
| 6 | Documentation | [DOCUMENTATION.md](DOCUMENTATION.md) |
| 7 | Workflow | [WORKFLOW.md](WORKFLOW.md) |
| 8 | Quality | [QUALITY.md](QUALITY.md) |
| 9 | Security | [SECURITY.md](SECURITY.md) |
| 10 | Operations | [OPERATIONS.md](OPERATIONS.md) |

Do not invent TAM, event taxonomies, or SLOs to complete an overlay. Label **Fact**, **Drift**, and **Unresolved** under Artifacts.

## Overlay as delta

Keep the required `##` headings. Fill Artifacts with pointers and facts. Product is the exception: [PRODUCT.md](PRODUCT.md) is overlay and canonical brief. Other stations point at `apps/docu` for technical facts. `__dev/` is scratch until it graduates into docs or this overlay.
