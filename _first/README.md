# First Principles

Some decisions are too consequential to become afterthoughts. This folder is a markdown factory for building software products with humans and agents in the loop.

It is agent-first, not agent-autonomous. Humans still decide product scope, security-sensitive changes, and anything that cannot be recovered from the repository.

## How to read this

Start with the essays in `articles/`. Each one argues why a concern has to be named before implementation, chat, or a generated UI invents it. Essays are for humans. They do not contain an agent prompt.

When you want to apply that concern to a real project, open the matching file in `principles/`. Same filename. The spec is the working recipe: artifacts, steps, validation, and — last — an agent prompt you can skip if you are doing the work yourself.

The twelve are stations, not a waterfall and not competing religions. Read them in order the first time. After that, open the station the work is actually touching.

A repo that only needs the factory can drop in `AGENTS.md`, `ABOUT.md`, and `principles/`. This README and `articles/` are the human pack.

Same filename in both folders: `articles/API.md` argues; `principles/API.md` operates. Do not merge those jobs. Do not look for `articles/index.md` or a FIRST skill.

When a station is in scope, read the essay for the argument, then the spec if you are going to apply it. An agent skips the essay unless a human asked for the argument.

## The twelve

Each station has a human essay and an operational spec. Read the essay to understand the argument; use the spec to do the work.

| # | Station | Human essay | Operational spec | Owns |
|---:|---|---|---|---|
| 1 | Product | [Read](articles/PRODUCT.md) | [Apply](principles/PRODUCT.md) | What, why, audience, GTM, and how we will know |
| 2 | Journeys | [Read](articles/JOURNEYS.md) | [Apply](principles/JOURNEYS.md) | Actors, states, permissions, errors, and completion |
| 3 | Design | [Read](articles/DESIGN.md) | [Apply](principles/DESIGN.md) | How the interface behaves and communicates |
| 4 | Architecture | [Read](articles/ARCHITECTURE.md) | [Apply](principles/ARCHITECTURE.md) | System boundaries, dependency direction, and deployment shape |
| 5 | Data | [Read](articles/DATA.md) | [Apply](principles/DATA.md) | Canonical domain concepts, ownership, lifecycle, and evolution |
| 6 | API | [Read](articles/API.md) | [Apply](principles/API.md) | Capability and contract boundaries |
| 7 | Documentation | [Read](articles/DOCUMENTATION.md) | [Apply](principles/DOCUMENTATION.md) | Durable, accurate, discoverable context |
| 8 | Workflow | [Read](articles/WORKFLOW.md) | [Apply](principles/WORKFLOW.md) | Actors, handoffs, work state, and human gates |
| 9 | Pipelines | [Read](articles/PIPELINES.md) | [Apply](principles/PIPELINES.md) | Automated validation and delivery |
| 10 | Quality | [Read](articles/QUALITY.md) | [Apply](principles/QUALITY.md) | Acceptance, tests, evals, and budgets |
| 11 | Security | [Read](articles/SECURITY.md) | [Apply](principles/SECURITY.md) | Trust, authorization, secrets, and agent permissions |
| 12 | Operations | [Read](articles/OPERATIONS.md) | [Apply](principles/OPERATIONS.md) | Runtime health, support, and recovery |

The map of stations, loops, and boundaries is [ABOUT.md](ABOUT.md). That file is for both audiences. It is not another essay.

This is not a methodology to install. It is not a waterfall. New stations need a distinctive decision they own; a shared theme or a new tool is not enough. Events remain Product, external contracts remain API, eval datasets remain Quality, telemetry remains Operations, and the commit-stage build remains Pipelines.

## Using FIRST in another repository

Copy `ABOUT.md` and `principles/` into the repository root. Do not copy other sibling directories in this tree. Use `AGENTS.md` as the starting template only when the target has no agent instructions; otherwise merge the FIRST load guidance into the existing instructions without overwriting them. Keep project-specific product decisions, architecture, and operating facts in that repository's own durable files; do not edit the generic specs to encode one project's choices.

The target repository's instructions override generic FIRST guidance. Adopt upstream FIRST changes deliberately by reviewing the diff rather than overwriting local instructions. The human pack—this README and `articles/`—is optional.

Validate the complete source set with:

```sh
python3 scripts/validate_docs.py
python3 -B scripts/test_validate_docs.py
```

From the parent repository root, prefix each script path with `_first/`. The existing lint workflow runs both commands on pull requests. Structural validation is not a substitute for the publication review described in [ABOUT.md](ABOUT.md).

## Agents

If you are setting up a coding agent to apply this factory, start at [AGENTS.md](AGENTS.md). Essays are optional for the agent. Specs are not. Point the agent at the target repo's own skills. There is no FIRST skill file to install.
