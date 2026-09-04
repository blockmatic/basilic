# Documentation Review

Reviewed: 2026-09-02  
Resolution pass: 2026-09-03

## Assessment

FIRST has a strong core: a clear human/agent split, a memorable station model, consistent operational specs, and careful boundaries between neighboring concerns. “Articles argue; principles operate” gives the set a useful information architecture.

The original review covered the 23-file, ten-station set. The resolution pass expands it to twelve stations and addresses the actionable structural findings. This file is an advisory review artifact in `maintainers/`, not another principle or part of the user pack.

## Resolution status

| Finding | Status | Resolution |
|---|---|---|
| Canonical source was ignored under `__dev` | Addressed | The set now lives in `_first/`, which is visible to Git. It remains untracked until intentionally added and committed. |
| API and Security both owned authorization | Resolved | Security owns policy; API represents and enforces the applicable requirement at the contract boundary; Journeys places the gate in the flow. |
| Journeys required reviewers to find an unhandled state | Resolved | Validation now requires every mapped state to trace to implementation or an explicit deferral. |
| Draft lifecycle was undefined | Resolved | `ABOUT.md` defines draft/stable semantics, version, and review date. |
| Multi-station composition was unclear | Resolved | `ABOUT.md` and `AGENTS.md` define primary/secondary station routing with an example. |
| Specs lacked a minimum artifact shape | Resolved | Every operational spec includes `Minimum Useful Artifact`. |
| Documentation invariants were manual | Resolved | `scripts/validate_docs.py` checks files, pairs, headings, front matter, parity, order, and local links. Regression tests protect the validator; the root lint workflow runs both. |
| Installation and update behavior was implicit | Resolved | `README.md` documents the drop-in boundary, precedence, update behavior, and validation command. |
| Essay set was uneven and repetitive | Improved | The longest essays received a focused redundancy pass; collection-wide editorial review remains part of stable publication. |
| External claims and citations needed review | Link sweep complete; author review pending | All 46 unique external URLs were checked through direct retrieval or their primary-site index/search results. The Jeff Patton link was updated. The author's 2015 Continuous Delivery page appears in the blog index but could not be retrieved directly. Precise technical claims touched in this pass were checked; personal case-study claims still need author approval. |

## Added principles

### Architecture First

Owns system decomposition, dependency direction, deployment topology, structural constraints, and decisions that are expensive to reverse. It does not own external contract shape, canonical data meaning, delivery automation, or runtime health.

### Data First

Owns canonical domain concepts, identity, authority, lifecycle, retention, lineage, invariants, and schema evolution. It does not own product event goals, external API representation, access policy, eval datasets, or operational telemetry.

## Remaining release work

1. Add and commit `_first/` so the new durable location has history and review.
2. Confirm the 2015 Continuous Delivery page and approve the personal case-study claims and remaining historical interpretations for publication.
3. Promote individual essays from `draft` to `stable` only after that review and a final collection-level edit.

## Release bar

The structural release bar now passes when `python3 scripts/validate_docs.py` succeeds. A stable editorial release additionally requires checked sources, intentional article status, and review of the collection as a whole.
