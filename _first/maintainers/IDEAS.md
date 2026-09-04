# Ideas

Parking lot for FIRST itself. Not a roadmap. Decided layout lives in [PACKAGING.md](PACKAGING.md).

## Later

- **CLI** that asks opt-in questions (UI? public API? production?) and writes `FIRST.md` plus only the chosen instance files. Until then, users edit markdown.
- **Website** with What / Why / Spec / Get started. Copy SoulSpec’s clarity, not a persona registry. Example adoptions (CLI, library, this monorepo) would help more than a marketplace of souls.
- **`first.json`** when a CLI or site must parse a package. Markdown `FIRST.md` is enough until then.
- **Adopter-pack validator** that checks only files listed in `FIRST.md`. The current `scripts/validate_docs.py` is for this source tree (twelve essay/spec pairs plus maintainer files).

## Not now

- Generating a Basilic Google-format `DESIGN.md` from `packages/ui` tokens. `tokens.css` remains source of truth until a real file is written on purpose.
- Renaming `_first/` to `first/`.
- Shipping FIRST as a Cursor skill or under `.agents/`.
