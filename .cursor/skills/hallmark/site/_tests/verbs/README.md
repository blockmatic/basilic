# Hallmark verbs — worked examples

Each verb demonstrated on a tiny, realistic input. Folders contain the input, the verb's output, and a one-page note explaining what fired and why.

| Verb | Folder | Input | What the verb does |
| --- | --- | --- | --- |
| `audit` | [`audit/`](audit/) | An AI-templated landing fragment | Read it, score against the anti-pattern list, return a ranked punch list. **Does not edit.** |
| `redesign` | [`redesign/`](redesign/) | A page with the AI structural template (centered hero · 3 cards · CTA · footer) | Throw out the structure, rebuild with a different fingerprint. **Preserves copy + IA.** |
| `study` | [`study/`](study/) | A described screenshot of a Pentagram-style portfolio | Extract DNA — macrostructure, archetypes, type-pairing role, accent — return a diagnosis report, then rebuild user content with that DNA. **Never copies pixels.** |

Each folder holds:

- **`input.html`** (or `input-description.md` for `study`) — what the user paste / attach.
- **`output.*`** — what the verb produces. For `audit` and `study`, this is a Markdown report. For `redesign`, this is a finished `index.html` + `style.css`.
- **`notes.md`** — one page explaining what fired, what reference files loaded, and what the durable artifact is.

The three verb tests together exercise every load path in the skill that the default-flow tests don't.
