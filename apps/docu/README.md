# Documentation

Fumadocs (Next.js 16 + MDX) site for architecture, ADRs, and development workflows.

```bash
pnpm --filter @repo/docu dev
```

http://localhost:3002. Live: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs).

Content is `content/docs/` (`architecture`, `development`, `testing`, `deployment`, `adrs`). Sidebar order is each folder’s `meta.json`.

**Crawl / LLM:** [`/robots.txt`](/robots.txt), [`/sitemap.xml`](/sitemap.xml), [`/llms.txt`](/llms.txt), [`/llms-full.txt`](/llms-full.txt). Policy: [Docs host crawl](content/docs/deployment/vercel.mdx#docs-host-crawl).

- [Getting Started](content/docs/development/index.mdx)
- [AI Workflow](content/docs/development/ai-workflow.mdx)
- [Architecture](content/docs/architecture/index.mdx)
- [Security](content/docs/architecture/security.mdx)
- [Deployment](content/docs/deployment/index.mdx)
