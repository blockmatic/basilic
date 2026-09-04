# First Principles

Some decisions are too consequential to become afterthoughts. This folder is a markdown factory for building software products with humans and agents in the loop.

It is agent-first, not agent-autonomous. Humans still decide product scope, security-sensitive changes, and anything that cannot be recovered from the repository.

## Who this is for

- **Users of the framework** — you. Copy the user pack into `_first/` in your repo. Edit [FIRST.md](FIRST.md) and the station files you opted into. Start with this README, then [ABOUT.md](ABOUT.md).
- **Maintainers of the framework** — people evolving FIRST itself. Go to [maintainers/README.md](maintainers/README.md). Do not copy `maintainers/` or `scripts/` into a product repo.

## How to read this

Start with the essays in `articles/`. Each one argues why a concern has to be named before implementation, chat, or a generated UI invents it. Essays are for humans. They do not contain an agent prompt.

When you want to apply that concern to a real project, open the matching file in `principles/`. Same filename. The spec is the working recipe: artifacts, steps, validation, and — last — an agent prompt you can skip if you are doing the work yourself.

The twelve are stations, not a waterfall and not competing religions. Read them in order the first time. After that, open the station the work is actually touching.

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

Copy the user pack into `_first/` at the repository root (the folder name sorts first in listings):

- [AGENTS.md](AGENTS.md)
- [ABOUT.md](ABOUT.md)
- `principles/`
- this README if you want the human door

Optional: `articles/`. Skip `maintainers/`, `scripts/`, and `basilic/`.

Add [FIRST.md](FIRST.md) listing which stations are in (path to the artifact) and which are out (one-line reason). Merge a pointer into the existing root `AGENTS.md`. Do not overwrite that file. Do not copy `ABOUT.md` and `principles/` into the repository root as loose files.

```markdown
- FIRST: `_first/AGENTS.md` then `_first/FIRST.md`; then `_first/principles/X.md` and the instance path listed in FIRST.md
```

Keep project-specific facts in `FIRST.md` and opted-in station files, or in docs those files point at. Do not edit the generic specs to encode one project's choices. Absent files beat empty stubs. Do not generate twelve skeletons.

Example `FIRST.md`:

```markdown
# FIRST
spec: 0.2-draft

## In
- product: _first/PRODUCT.md
- design: _first/DESIGN.md
- architecture: docs/architecture.md

## Out
- operations — not in production
```

When Design is in, the instance file follows [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md). Prefer `_first/DESIGN.md`. Lint with an explicit path if you use the Google CLI. Never two palettes.

The target repository's instructions override generic FIRST guidance. Adopt upstream FIRST changes by replacing factory files (`AGENTS.md`, `ABOUT.md`, `principles/`) after reviewing the diff. Never overwrite `FIRST.md` or instance files.

Complete structural validation is for this source tree, not a drop-in copy. From this directory:

```sh
python3 scripts/validate_docs.py
python3 -B scripts/test_validate_docs.py
```

From the parent repository root, prefix each script path with `_first/`. The existing lint workflow runs both commands on pull requests. Structural validation is not a substitute for the publication review described in [ABOUT.md](ABOUT.md).

## Agents

If you are setting up a coding agent to apply this factory, start at [AGENTS.md](AGENTS.md). Essays are optional for the agent. Specs are not. Point the agent at the target repo's own skills. There is no FIRST skill file to install.
