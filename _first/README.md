# FIRST in Basilic

Basilic is an **adopter** of FIRST. The factory source is [`blockmatic/first`](https://github.com/blockmatic/first). Essays and maintainer process live there and on the public site.

This folder holds:

- Vendored user pack: [`README.md`](README.md), [`AGENTS.md`](AGENTS.md), [`ABOUT.md`](ABOUT.md), [`templates/`](templates/)
- This repository’s instance: [`FIRST.md`](FIRST.md) and [`basilic/`](basilic/)
- Installed station skills: `.agents/skills/f/` via `npx skills add blockmatic/first`

Do not edit the vendored files to encode Basilic facts. Put those in `FIRST.md` and `basilic/`. When updating from upstream, replace `README.md`, `AGENTS.md`, `ABOUT.md`, and `templates/` after reviewing the diff. Refresh `/f` with the skills CLI. Never overwrite `FIRST.md` or `basilic/`.

## Load

Root [`AGENTS.md`](../AGENTS.md) points to [`AGENTS.md`](AGENTS.md). Canonical load order: `_first/AGENTS.md` → `_first/ABOUT.md` → `_first/FIRST.md` → this repository's instructions and skills → `/f-*` → the instance path listed in FIRST.md.

## Update from upstream

```sh
npx skills add blockmatic/first
```

Then replace `_first/README.md`, `_first/AGENTS.md`, `_first/ABOUT.md`, and `_first/templates/` from a first release after reviewing the diff. Skip `instance/`, `maintainers/`, `principles/`, and `articles/`. Essays live on [GitHub](https://github.com/blockmatic/first/tree/main/_first/articles).

## Human door

- Map: [ABOUT.md](ABOUT.md)
- Overlays: [basilic/](basilic/)
- Essays: [blockmatic/first articles](https://github.com/blockmatic/first/tree/main/_first/articles)
