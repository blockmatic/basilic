# Documentation First

## Principle

Keep the context future humans and agents need to decide well in durable project files, not in conversations that disappear.

## Statement

I document decisions and context, not obvious code. If someone will need to rediscover it, explain it twice, or guess why we chose this, it belongs in a file. Chat is for coordination. Files are the system of record. Wrong docs are worse than no docs.

## Outcome

Consequential decisions, conventions, setup steps, domain context, prompt templates, and behavioral specs live in discoverable project files. Documentation matches current behavior or explicitly notes drift. When behavior or assumptions change, the files change in the same work.

## Artifacts

- `README.md` and package READMEs
- `AGENTS.md` and agent instructions
- Architecture documentation and ADRs
- Project conventions and operational notes
- Domain documentation and setup guides
- Prompt templates, behavioral specs, and context-engineering notes as versioned project files
- Changelog entries for behavior changes worth remembering
- `llms.txt` for selective public-site orientation when the product publishes substantial web documentation

Prefer linking over duplicating. One canonical source, pointers elsewhere.

Public documentation may include `llms.txt` as a selective, machine-readable orientation to website content. It complements human navigation and `sitemap.xml`; it does not replace repository agent instructions in `AGENTS.md`. Mention it in `AGENTS.md` only when agents are responsible for regenerating or validating it as public documentation changes.

## Minimum Useful Artifact

- intended reader and the question the document answers
- canonical location and links from likely entry points
- decision, constraint, or procedure that cannot be inferred safely
- relevant implementation or source-of-truth links
- owner or event that should trigger the next review

## Recipe

1. Inspect what documentation exists and where humans and agents look first.
2. Understand how those files compare to implementation. Flag contradictions and drift.
3. Identify missing context: decisions, constraints, conventions, setup, domain rules.
4. Propose the smallest useful doc — decision record, convention note, README section.
5. Write it. Prefer one canonical source.
6. When implementing, update docs in the same change if behavior or assumptions changed.
7. Remove or archive docs that are wrong or obsolete.
8. Validate that a new contributor can set up and orient from files without asking in chat.

## Validation

- A new contributor can set up and orient from docs without asking in chat.
- ADRs exist for consequential architectural decisions, or the decision is explicitly deferred.
- Agent instructions reflect how the project actually works today.
- Chat is not treated as the system of record.

## Definition of Done

This station’s durable context is written, accurate, and discoverable. Documentation drift is resolved or explicitly tracked. Future work will not need to rediscover what was already decided. This is not “CI is green.”

Scratch (`__dev/` or chat) **graduates** when a decision must survive a new session: write it into the canonical doc (or an ADR) in the same change. Do not leave load-bearing Fact only in gitignored scratch.

## Agent Prompt

Apply Documentation First to this repository.

Read existing READMEs, AGENTS.md, architecture docs, ADRs, and the target project's own instructions before acting. Compare documentation to implementation. Identify contradictions, drift, and missing context.

Document decisions and conventions — not obvious code. Preserve intentional existing documentation. Propose the smallest useful doc update. When you change behavior, constraints, or conventions, update the durable project files in the same work. Do not add documentation volume without a clear future reader. Do not leave load-bearing decisions only in chat.

## Notes

**Documentation vs everything:** Other stations produce decisions. Documentation decides which context must stay durable.

**Documentation vs Workflow:** Workflow determines when context is created and handed off, and runs CI. Documentation preserves it, including prompt files. Quality already owns eval datasets. Architecture already owns application structure if context-engineering is a structural boundary.

**Navigation:** [Human essay](../articles/DOCUMENTATION.md) · [Factory map](../ABOUT.md)
