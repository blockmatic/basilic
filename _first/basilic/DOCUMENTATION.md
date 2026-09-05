# Documentation First

## Principle

See /f-info-architect.

## Artifacts

- **Fact:** Product intent: [PRODUCT.md](PRODUCT.md) — brief, feature map, roadmap. Not in `apps/docu`
- **Fact:** Adopter technical docs: [`../../apps/docu/content/docs/`](../../apps/docu/content/docs/) — architecture, ADRs, development, testing, deployment
- **Fact:** Generated-project docs snapshot: `docs/basilic/` is assembled from `apps/docu/content/docs` at pack time. Canonical authoring stays in `apps/docu`. The snapshot is not a second source.
- **Fact:** How to run: [`../../README.md`](../../README.md) and app/package READMEs — link to docs, no duplication ([docs.mdc](../../.cursor/rules/base/docs.mdc))
- **Fact:** Agents: [`../../AGENTS.md`](../../AGENTS.md); constraints `.cursor/rules/`; skills `.agents/skills/`
- **Fact:** Workflow index: [ai-workflow.mdx](../../apps/docu/content/docs/development/ai-workflow.mdx)
- **Fact:** Public LLM indexes: `/llms.txt`, `/llms-full.txt` on the docs site
- **Fact:** Portable factory: vendored `../AGENTS.md`, `../ABOUT.md`, `../README.md`. Station specs: `/f-*` from `npx skills add blockmatic/first`. This folder is the Basilic adoption pack, not a second docs site. Essays live in [`blockmatic/first`](https://github.com/blockmatic/first/tree/main/_first/articles).
- **Fact:** Same-change rule: update matching MDX when behavior, commands, or conventions change; update [PRODUCT.md](PRODUCT.md) when goals, feature map, or horizons change
- **Fact:** `__dev/` is gitignored scratch. Do not treat it as Fact or as the backlog. Remembered technical decisions go in `apps/docu` or ADRs. Product decisions go in [PRODUCT.md](PRODUCT.md).
- **Fact:** Architecture MDX matches this overlay: TypeBox on Fastify generates OpenAPI; shipped path is Vercel + Supabase; PostHog is chosen not installed. Named remaining drift: mobile vs web, PostHog not in the runtime.

## Minimum Useful Artifact

- reader: future human or agent on this task
- canonical location: product intent → [PRODUCT.md](PRODUCT.md); technical → `apps/docu/content/docs/…`; README points at both
- decision or procedure that cannot be inferred safely
- implementation links
- trigger for next review: the same PR that changes behavior

## Notes

Other stations produce decisions. Documentation decides which context must stay durable. Workflow determines when context is created. Do not encode this repo’s product facts in factory `principles/` or `../ABOUT.md`. Do not write Basilic product intent into `apps/docu`.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/DOCUMENTATION.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/DOCUMENTATION.md) · [Factory map](../ABOUT.md) · [AI workflow](../../apps/docu/content/docs/development/ai-workflow.mdx)
