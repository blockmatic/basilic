---
description: Emit a closed ViewConfig with set_view. Use when the user typed a board command.
---

Call `set_view` with `{ viewConfig, honesty? }`. `viewConfig` is version 1, a closed surface, a title, and a SearchQuery. Never CSS, never a json-render Spec, never prices. Novel filters come from tools, not from inventing query keys. Use `surface: dashboard` for market overview / what should I look at. `chart` is live. `news` and `coin` stay unimplemented (table plus honesty).
