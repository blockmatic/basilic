# Documentation

Fumadocs (Next.js 16 + MDX) site for Basilic, the API-First AI TypeScript FullStack Starter: architecture, ADRs, development, testing, and deployment. Visual language is root `DESIGN.md`.

```bash
pnpm --filter @repo/docu dev
```

https://docu.basilic.localhost. Live: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs).

Content is `content/docs/` (`architecture`, `development`, `testing`, `deployment`, `adrs`). Sidebar order is each folder’s `meta.json`.

**Crawl / LLM:** [`/robots.txt`](https://basilic-docs.vercel.app/robots.txt), [`/sitemap.xml`](https://basilic-docs.vercel.app/sitemap.xml), [`/llms.txt`](https://basilic-docs.vercel.app/llms.txt), [`/llms-full.txt`](https://basilic-docs.vercel.app/llms-full.txt). Policy: [Docs host crawl](content/docs/deployment/vercel.mdx#docs-host-crawl).

- [Getting Started](content/docs/development/index.mdx)
- [Product Ready](content/docs/testing/product-ready.mdx)
- [AI Workflow](content/docs/development/ai-workflow.mdx) — Basilic `/w-*` daily path; not in-app chat
- [AI](content/docs/architecture/ai.mdx) — Fastify `/ai/*` control-plane APIs; four planes
- [Eve](content/docs/architecture/eve.mdx) — durable agent runtime (hello in `apps/agents`)
- [Architecture](content/docs/architecture/index.mdx)
- [Security](content/docs/architecture/security.mdx)
- [Deployment](content/docs/deployment/index.mdx)
- [Scaffolding and Releases](content/docs/adrs/012-scaffolding-and-releases.mdx)
