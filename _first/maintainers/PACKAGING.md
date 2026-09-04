# Packaging

How FIRST is laid out on disk, who edits which files, and which external formats we borrow. Not a thirteenth station. Users of the framework do not copy this file.

## Two people

- **User** — adopting FIRST in a product repo. Copies the user pack into `_first/`, edits `FIRST.md` and instance files, merges a pointer into root `AGENTS.md`.
- **Maintainer** — evolving FIRST itself. Work lives in this folder, `../scripts/`, and `../articles/` (essays are written here, read by users).

Human vs agent is a second axis inside the user pack: `README.md` and `articles/` for humans; `AGENTS.md` and `principles/` for agents; `ABOUT.md` for both.

## Format references

Borrow shape, not identity.

- **Packaging** — [SoulSpec](https://soulspec.org/): one folder, a short manifest, required core plus opt-in files, markdown until a tool needs JSON. FIRST is not a persona spec. Do not add `SOUL.md`, `IDENTITY.md`, or `HEARTBEAT.md`.
- **Design artifact** — [DESIGN.md Format](https://raw.githubusercontent.com/google-labs-code/design.md/refs/heads/main/docs/spec.md) ([google-labs-code/design.md](https://github.com/google-labs-code/design.md), alpha): when Design is in, the instance file is a `DESIGN.md` with optional YAML tokens plus markdown rationale. Design First stays behavior, states, copy, motion, and browser verification. The Google file is how visual identity is written down, parallel to OpenAPI versus API First. See [../principles/DESIGN.md](../principles/DESIGN.md).

## Three layers

1. **Harness** — root `AGENTS.md` (this repo also has `CLAUDE.md` pointing at it). Project commands, skills, rules. Merge a FIRST pointer. Do not replace the file.
2. **Factory** — `_first/AGENTS.md`, `ABOUT.md`, `principles/`. Treat as vendor. Upstream update means replacing those files, never instance files.
3. **Instance** — `_first/FIRST.md` plus only the station files the project opted into, or pointers to docs that already exist. Humans and agents edit these.

The human pack (`README.md`, `articles/`) is optional for adopters.

## Folder

`_first/` sorts first in listings. Do not rename to `first/`.

```text
repo/
  AGENTS.md                 # USER harness stub
  _first/                   # USER pack
    README.md
    AGENTS.md
    ABOUT.md
    FIRST.md                # USER instance map
    principles/
    articles/               # optional human pack
    basilic/                # this repo’s instance only
    maintainers/            # MAINTAINER — do not copy
    scripts/                # MAINTAINER validator
```

Copy for a new user repo: `AGENTS.md`, `ABOUT.md`, `principles/`, and this README if they want the human door. They add `FIRST.md`. Skip `maintainers/`, `scripts/`, and `basilic/`. `articles/` is optional.

## Why root AGENTS.md points in

[AGENTS.md](https://agents.md/) at the repository root is the portable always-on hook. Nested `_first/AGENTS.md` applies when editing files under `_first/`, not when editing `apps/web/`. The factory rules live in `_first/AGENTS.md`. Root `AGENTS.md` points at it in a few lines.

SoulSpec’s Cursor install writes `.cursor/rules/` for the same reason. FIRST uses root `AGENTS.md` instead so Codex, Copilot, and Windsurf get the hook without a Cursor-only copy.

## Load order

1. Root `AGENTS.md`
2. `_first/AGENTS.md`
3. `_first/ABOUT.md`
4. `_first/FIRST.md`
5. The repository’s own instructions and skills (these override generic FIRST)
6. `_first/principles/X.md` for the primary station
7. The instance path listed in `FIRST.md`

Do not load `maintainers/` on a product task.

## FIRST.md

Markdown analogue of SoulSpec’s `soul.json`. Lists which stations are in (path to the artifact), which are out (one-line reason). Paths may point outside `_first/` when the project already has a canonical doc.

Absent files beat empty stubs. Do not generate twelve skeletons. Human gates (product scope, security-sensitive changes, destructive operations) still apply when `SECURITY.md` is absent — they stay in factory `AGENTS.md`.

When Design is in, point at one `DESIGN.md`. Prefer `_first/DESIGN.md`. Lint with an explicit path: `npx @google/design.md lint _first/DESIGN.md`. A root `DESIGN.md` only if existing tooling requires it; then `FIRST.md` points at that one file. Never two palettes.

Google `DESIGN.md` may omit sections via YAML `omitted` with a reason. Unknown headings are preserved: use them for interface states, copy, motion, and accessibility beyond contrast.

## Copy, edit, replace

| File | Who | Update from upstream |
|---|---|---|
| `_first/AGENTS.md`, `ABOUT.md`, `principles/` | User copies; maintainer authors | Replace after reviewing the diff |
| `_first/FIRST.md`, opted-in station files | User edits | Never overwrite |
| Root `AGENTS.md` | User merges a pointer | Never overwrite the rest |
| `maintainers/`, `scripts/` | Maintainer only | Not copied out |

## Rejected

- **`first/` without the underscore** — loses listing order.
- **`.agents/_first`** — hidden; sits next to the skills CLI overwrite target; nested `AGENTS.md` still would not load for app work.
- **A FIRST skill** — refresh clobbers local edits; users must edit instance files. There is no FIRST skill to install.
- **Root `PRODUCT.md` … `OPERATIONS.md`** — twelve optional files pollute the root. The folder is the package.
- **`first.json`** — SoulSpec’s JSON exists for CLI and registry. Skip until those exist.
- **Cursor-only `.cursor/rules` as the spec hook** — not portable. A one-line always-on pointer in this repo is optional; the spec hook is `AGENTS.md`.
- **Persona files** — not FIRST’s job.

## Related

- User doors: [../README.md](../README.md), [../ABOUT.md](../ABOUT.md), [../AGENTS.md](../AGENTS.md), [../FIRST.md](../FIRST.md)
- Parking lot: [IDEAS.md](IDEAS.md)
- Review: [FEEDBACK.md](FEEDBACK.md)
