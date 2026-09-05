# First Principles

Version: 0.3-draft  
Last reviewed: 2026-09-05

Some decisions are too consequential to become afterthoughts. Important project knowledge should live in files, not disappear into conversations.

This is an agent-first factory, not an agent-autonomous one. Humans still decide product scope, security-sensitive changes, and anything that cannot be recovered from the repository. Agents inspect, propose, implement, and update durable context. They do not silently invent the goal.

"First" means: make the concern explicit before implementation, chat, or a generated UI invents it. FIRST is a spec-to-code factory: shared language between agents and domain experts, product and system design before code. The ten are stations on one factory, not a waterfall and not competing religions.

## Who this is for

- **Users of the framework** — adopting FIRST in a product repo. Install `npx skills add blockmatic/first`. Copy the user pack into `_first/`. Edit [FIRST.md](FIRST.md) and write overlays only for stations listed as In. Merge a pointer into root `AGENTS.md`.
- **Maintainers of the framework** — evolving FIRST itself. Start at [`blockmatic/first` maintainers](https://github.com/blockmatic/first/blob/main/_first/maintainers/README.md). Do not copy `maintainers/` or `instance/`.

## Dual audience (minimum)

- **User of the framework:** install `/f`, copy the user pack, write `FIRST.md`, keep product facts in instance files or docs those files point at.
- **Maintainer of the framework:** edit `principles/`, `articles/`, `skills/f/`, `maintainers/`, and `packages/validate`. Do not encode one adopter’s product into generic files.

Each principle’s **Definition of Done** is that station’s artifact. It is not the whole factory, not CI green, and not Product success after use. Quality / Product / Workflow qualify “done” differently — see Boundaries below.

## Audiences

Inside the user pack:

- **Humans reading:** start at [README.md](README.md), then `articles/`.
- **Agents operating:** start at [AGENTS.md](AGENTS.md), then this file, then [FIRST.md](FIRST.md), then the matching `/f-*` skill.
- **Humans applying:** this file plus the matching `/f-*` skill (or `principles/X.md` in this factory repo). The essay is optional once you know the argument.

Articles argue. Principles operate. Same filename in both folders.

## Drop-in

Install the skill, then copy into `_first/` (not the repository root as loose files):

```bash
npx skills add blockmatic/first
```

- [AGENTS.md](AGENTS.md)
- [ABOUT.md](ABOUT.md) (this file)
- [README.md](README.md) if you want the human door
- [FIRST.md](FIRST.md) — create this; list in and out

[README.md](README.md) and `articles/` are the human pack in this factory. They are not required for an agent to operate. Do not copy `principles/` or `articles/` into an adopter repo. Skip `maintainers/` and `instance/`. Layout and why: [PACKAGING.md](https://github.com/blockmatic/first/blob/main/_first/maintainers/PACKAGING.md).

## Documentation inventory

User pack — copy these (plus `FIRST.md` you create):

| Path | Audience | Relationship |
|---|---|---|
| [README.md](README.md) | Users, humans | Front door, copy instructions, station index |
| [AGENTS.md](AGENTS.md) | Users, agents | Load order, operating rules, reusable prompt |
| [ABOUT.md](ABOUT.md) | Users, both | Canonical map of stations, loops, boundaries, overlay contract |
| [FIRST.md](FIRST.md) | Users, both | This repo’s in/out map and instance paths |
| Installed `/f-*` | Users applying and agents operating | Operational spec (copy of `principles/X.md` in this factory) |

## Overlay contract

Overlays are deltas, not a second copy of `/f-*`. Create a file only for a station listed as In. Absent files beat empty stubs. Do not generate ten skeletons.

Required `##` headings:

`Principle` · `Artifacts` · `Minimum Useful Artifact` · `Notes`

- **Principle:** `See /f-<station>`.
- **Artifacts:** label **Fact**, **Drift**, and **Unresolved**. Point at canonical docs. Do not paste Recipe, Statement, Outcome, Validation, Definition of Done, or Agent Prompt from the spec.
- Product may add `Brief` · `Feature map` · `Roadmap` after Notes when the overlay is also the canonical brief.

`FIRST.md` In keys are the ten stations. A Google-format `DESIGN.md` is a Journeys artifact, not a station; point at it under Journeys when the file exists.

Factory-only (do not copy into an adopter repo): `articles/X.md` and `principles/X.md`. Essays argue; principles operate. Same filenames.

Maintainer pack — do not copy: [maintainers/](https://github.com/blockmatic/first/tree/main/_first/maintainers). Skip the factory `instance/` overlays. The source-tree validator is `packages/validate` in [blockmatic/first](https://github.com/blockmatic/first).

The canonical station order is Product → Journeys → Architecture → Data → API → Documentation → Workflow → Quality → Security → Operations. The filenames are identical across `articles/` and `principles/`; the directory names distinguish argument from operation.

## Lifecycle

- **Draft** means the argument, sourcing, or boundary language may still change.
- **Stable** means the essay and spec agree, precise claims and links were reviewed, and the documentation checks pass.
- A version identifies the factory set. Project-specific decisions belong in the adopting repository, not in these generic files.

This source set remains draft until its external references receive a publication review. [FEEDBACK.md](https://github.com/blockmatic/first/blob/main/_first/maintainers/FEEDBACK.md) is an advisory review artifact, not part of the user pack.

## Composing stations

Choose one primary station for the decision being made. Load a secondary station only when the change crosses a boundary that station owns. Each station updates its own artifact; it may reference a sibling but does not duplicate the sibling's policy.

Example: adding document export is Product for why the capability exists, Journeys for the user's completion and failure paths, Architecture for component and dependency changes, Data for ownership and retention of exported content, API for the contract, Security for who may export, and Quality for the release bar. One change can touch several stations without creating several sources of truth.

## Loops

**Inspect loop** — how an agent, or a human following a spec, applies a station to a repository:

analyze → understand → take notes → identify gaps → propose → implement → validate → update project knowledge

Inspect before generating. Preserve intentional existing decisions. Distinguish facts, reasonable inferences, assumptions, and unresolved questions. Ask a human only when consequential ambiguity cannot be resolved from the project.

**Work loop** — how a change moves. It lives in Workflow First only:

idea → plan → implement → review → pipeline signals → approval → release → learning

The automated stretch of that loop lives here too. Do not keep a third loop in this file.

## The ten

1. **Product** — what we are building, for whom, why it is worth building, and how we will know
2. **Journeys** — how someone finishes a job, including errors, permissions, state, and how the interface expresses it
3. **Architecture** — how the system is divided, depends, and deploys before local choices harden into structure
4. **Data** — the canonical domain model, ownership, lifecycle, and evolution before stores proliferate competing truths
5. **API** — the capability and its boundary, before consumers couple to an accident
6. **Documentation** — which context must remain durable and discoverable
7. **Workflow** — how work moves, including how a change reaches a validated, deployable state
8. **Quality** — what "good" means before anyone optimizes toward an undefined target
9. **Security** — what we are trusting, protecting, exposing, and allowing
10. **Operations** — how we see, support, and recover the running system

Event taxonomy is Product. Domain concepts, ownership, retention, and schema evolution are Data. External capability schemas are API. Eval datasets are Quality. Telemetry is Operations. Deployment topology is Architecture; deployment execution is Workflow.

## Boundaries

Each station may point at a sibling in one sentence. It may not re-teach it.

- **Product** owns what, why, how we will know, the event taxonomy, and GTM as a field. Not release bars, not error rates, not marketing automation.
- **Journeys** owns what happens and how the interface expresses the job: actors, states, where permission gates occur, and completion. Security owns the permission policy. Not GTM acquisition maps.
- **Architecture** owns system decomposition, dependency direction, deployment topology, and structural tradeoffs. Not endpoint shape or runtime health.
- **Data** owns canonical domain concepts, data ownership, lifecycle, retention, lineage, and schema evolution. Not product event goals or external contract shape.
- **API** owns capability and contract shape, including how Security-owned authorization requirements and denials appear at the boundary. Not the authorization policy.
- **Documentation** owns durable memory. Owns "chat is not the system of record" once.
- **Workflow** owns actors, handoffs, issue/PR state, human gates, the automated path, the commit-stage build, and readable failures. Not what "good" means.
- **Quality** owns the release bar: tests, evals, budgets. Not funnels, not "CI ran."
- **Security** owns trust, identities, authorization policy, secrets, classification, and the agent as a principal. Not contract shape.
- **Operations** owns runtime health, recovery, and verify-in-the-running-system. Not product analytics.

"Done" is always qualified. Quality: the bar was met. Product: observation after use. Workflow: the bar actually ran.

Human gates — product scope, security-sensitive changes, destructive operations — are Workflow and Security. The other stations point at them. They do not reprint them.
