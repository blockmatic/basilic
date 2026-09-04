# FIRST maintainers

You evolve the factory: stations, essays, packaging, and the source-tree validator. Users of FIRST never need this folder.

Start here. Then:

- [PACKAGING.md](PACKAGING.md) — layout, load order, copy vs edit, format references, rejected placements
- [IDEAS.md](IDEAS.md) — parking lot (CLI, site, JSON, adopter validator)
- [FEEDBACK.md](FEEDBACK.md) — documentation review and remaining release work

User-facing files live one directory up. Agents on a product task load [../AGENTS.md](../AGENTS.md), [../ABOUT.md](../ABOUT.md), and [../FIRST.md](../FIRST.md). They do not load this folder.

Validate the source tree from `_first/`:

```sh
python3 scripts/validate_docs.py
python3 -B scripts/test_validate_docs.py
```

Do not encode one product’s facts into `principles/`. Project instances belong in the adopting repo (`FIRST.md` and opted-in station files, or this repo’s `basilic/` pack).
