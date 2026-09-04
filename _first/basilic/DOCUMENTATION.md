# Documentation First

## Principle

Keep the context future humans and agents need to decide well in durable project files, not in conversations that disappear.

## Statement

I document decisions and context, not obvious code. If someone will need to rediscover it, explain it twice, or guess why we chose this, it belongs in a file. Chat is for coordination. Files are the system of record. Wrong docs are worse than no docs.

## Outcome

Consequential decisions, conventions, setup steps, and domain context live in discoverable project files. Documentation matches current behavior or explicitly notes drift. When behavior or assumptions change, the files change in the same work.

## Artifacts

- **Fact:** Canonical: [`../../apps/docu/content/docs/`](../../apps/docu/content/docs/) — architecture, ADRs, development, testing, deployment
- **Fact:** How to run: [`../../README.md`](../../README.md) and app/package READMEs — link to docs, no duplication ([docs.mdc](../../.cursor/rules/base/docs.mdc))
- **Fact:** Agents: [`../../AGENTS.md`](../../AGENTS.md); constraints `.cursor/rules/`; skills `.agents/skills/`
- **Fact:** Workflow index: [ai-workflow.mdx](../../apps/docu/content/docs/development/ai-workflow.mdx)
- **Fact:** Public LLM indexes: `/llms.txt`, `/llms-full.txt` on the docs site
- **Fact:** Portable factory: `../` (ABOUT, AGENTS, FIRST.md, principles, articles). This folder is the adoption pack, not a second docs site. Maintainers live in `../maintainers/`.
- **Fact:** Same-change rule: update matching MDX when behavior, commands, or conventions change
- **Drift:** named in sibling instances (PostHog, “API as source of truth”, portability vs Vercel). Fix MDX in the same work when you change the fact; do not leave load-bearing drift only in chat.

## Minimum Useful Artifact

- reader: future human or agent on this task
- canonical location: usually `apps/docu/content/docs/…`; README points there
- decision or procedure that cannot be inferred safely
- implementation links
- trigger for next review: the same PR that changes behavior

## Recipe

1. Inspect READMEs, `AGENTS.md`, Fumadocs MDX, ADRs, rules, and skills.
2. Compare those files to implementation. Flag contradictions.
3. Identify missing decisions, constraints, setup, domain rules.
4. Propose the smallest useful doc — ADR, MDX section, README pointer.
5. Write it in `apps/docu` (or the collocated README). One canonical source.
6. Update docs in the same change if behavior or assumptions changed.
7. Remove or archive docs that are wrong.
8. Validate that a new contributor can set up and orient from files without asking in chat.

## Validation

- A new contributor can set up and orient from README + docs without asking in chat.
- ADRs exist for consequential architectural decisions, or the decision is deferred.
- Agent instructions reflect how the project works today.
- Chat is not the system of record.
- Generic FIRST files stay free of this repo’s product paths.

## Definition of Done

Durable context is written, accurate, and discoverable. Documentation drift is resolved or explicitly tracked. Future work will not need to rediscover what was already decided.

## Agent Prompt

Apply Documentation First to Basilic.

Read root README, `AGENTS.md`, `apps/docu/content/docs/`, ADRs, and `.cursor/rules` before acting. Compare documentation to implementation.

Document decisions and conventions — not obvious code. Propose the smallest useful MDX or README update. When you change behavior, update durable files in the same work. Do not leave load-bearing decisions only in chat. Do not encode this repo’s product facts in `../principles/` or `../ABOUT.md`.

## Notes

**Documentation vs everything:** Other stations produce decisions. Documentation decides which context must stay durable.

**Documentation vs Workflow:** Workflow determines when context is created. Documentation preserves it.

**Navigation:** [Generic spec](../principles/DOCUMENTATION.md) · [Human essay](../articles/DOCUMENTATION.md) · [Factory map](../ABOUT.md) · [AI workflow](../../apps/docu/content/docs/development/ai-workflow.mdx)
