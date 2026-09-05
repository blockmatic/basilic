---
name: next-v16
description: Next.js 16 App Router performance, caching, server components, server actions, routing, and codebase-hygiene best practices — plus a category-major review/refactor algorithm with codebase-level (remove/dedup/reuse) findings. This skill should be used when writing Next.js 16 App Router code, configuring caching with 'use cache' or the previous fetch-cache model, building Server Components, setting up parallel/intercepting routes, configuring next.config OR proxy.ts, OR auditing/refactoring a Next.js codebase (single file or whole repo). This skill does NOT cover generic React 19 patterns (use vercel-react-v1) or non-Next.js server rendering.
---

# Skill: next-v16

Next.js 16 App Router (GA October 2025). Prefer the version-matched docs in `node_modules/next/dist/docs/` over training data. Codemods: `npx @next/codemod@canary upgrade latest`, `middleware-to-proxy`, `next-async-request-api`.

## Scope

- Applies to: Next.js 16 App Router — Turbopack, Cache Components vs previous cache model, `proxy.ts`, async request APIs, Server Components, Server Actions, streaming, metadata, client islands
- Does NOT cover: Pages Router, generic React 19 (see vercel-react-v1), non-Next server rendering

## Assumptions

- Next.js 16.x, React 19.2 App Router, Node.js 20.9+, TypeScript 5.1+
- Two cache models exist. Detect `cacheComponents` in `next.config` before choosing APIs
- `fetch` is **not** cached by default in either model. Opt in explicitly

## Principles

- Read `node_modules/next/dist/docs/` for this installed version before generating Next APIs
- Cache is opt-in. Declare intent on every server `fetch`
- Network boundary is `proxy.ts` (Node.js). Auth gates, rewrites, redirects, header mutation
- Request APIs are async: `await cookies()`, `await headers()`, `await draftMode()`, `await params`, `await searchParams`
- Turbopack is the default bundler. `--webpack` is an opt-out, not the 16 idiom
- Prefer Server Components. Push `'use client'` to interactive leaves
- When the user asks to audit or modernize Next code, follow [`references/_review-algorithm.md`](references/_review-algorithm.md)

## Constraints

### MUST

- `await` `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`
- Call `revalidateTag(tag, profile)` with a `cacheLife` profile (`'max'` | `'hours'` | `'days'` | inline `{ expire }`). One-arg form is deprecated
- Use `updateTag(tag)` from Server Actions when the user must see the write immediately (read-your-writes). Use `revalidateTag(tag, 'max')` for stale-while-revalidate
- Export `proxy` from `proxy.ts` (named or default). Runtime is `nodejs` and cannot be set to Edge
- Before adding `'use cache'`, `cacheLife`, or `cacheTag`, confirm `cacheComponents: true`

### SHOULD

- Enable Cache Components only as an explicit migration: `cacheComponents: true`, then replace segment configs `dynamic` / `revalidate` / `fetchCache` with `'use cache'` + `cacheLife`. Guide: [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- If the app was **not** adopting `experimental.dynamicIO` / `experimental.useCache` / `experimental.ppr`, **remove those flags**. Do not set `cacheComponents: true` as a rename — it can fail the build for uncached data outside Suspense
- Without Cache Components, cache with `cache: 'force-cache'`, `next: { revalidate, tags }`, or `unstable_cache`. Guide: [Caching without Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- Keep a `config.matcher` on `proxy.ts` that excludes `/_next/static`, `/_next/image`, and public assets
- Use `next/image` `remotePatterns` (not deprecated `images.domains`). Use `next/image`, not `next/legacy/image`
- Generate sitemaps/robots from `app/sitemap.ts` and `app/robots.ts`
- Import `cacheLife` / `cacheTag` from `next/cache` (stable). Do not use `unstable_cacheLife` / `unstable_cacheTag`
- Rename `skipMiddlewareUrlNormalize` to `skipProxyUrlNormalize`

### AVOID

- Generating `'use cache'` in an app that has not set `cacheComponents: true` (directive is a Cache Components feature)
- Flipping `cacheComponents: true` because `experimental.dynamicIO` / `experimental.useCache` / `experimental.ppr` were present. Enabling the flag is a programming-model migration
- `middleware.ts` for new code. Keep it only if Edge runtime is still required; it is deprecated
- Sync `params` / `cookies()` / `headers()` (removed, not warned)
- `next lint` (removed). Lint with ESLint or Biome
- `experimental.ppr`, `experimental.dynamicIO`, `experimental.useCache`, `export const experimental_ppr` (removed)
- `experimental.turbopack` (moved to top-level `turbopack`)
- `experimental.turbo.persistentCaching` — that is not the Next 16 API. Filesystem cache is `experimental.turbopackFileSystemCacheForDev` / `experimental.turbopackFileSystemCacheForBuild` (on by default)
- `next dev --turbopack` / `next build --turbopack` as the 16 idiom. Turbopack is already default; `--webpack` is the opt-out
- Custom `webpack` in config while running default `next build` (fails). Migrate to Turbopack or pass `--webpack`
- Treating `'max'` on `revalidateTag` as “read-your-writes”. That is SWR; use `updateTag` in Server Actions
- Claiming Server Actions must replace every Route Handler. Route Handlers remain correct for cookies, webhooks, OAuth callbacks, and proxying an external API

## Interactions

- React 19 concurrent UI: [vercel-react-v1](../vercel-react-v1/SKILL.md)
- Client data after hydration: [tanstack-query-v5](../tanstack-query-v5/SKILL.md)
- Forms that stay on the Next server: [b/b-nextjs-form](../b/b-nextjs-form/SKILL.md)

## Two cache models (do not mix)

| Config | What to generate |
| --- | --- |
| `cacheComponents` unset / `false` | Previous model. `fetch` uncached unless `cache: 'force-cache'` or `next.revalidate`. Segment configs `dynamic`, `revalidate`, `fetchCache` still work. `unstable_cache` for non-fetch. Do **not** emit `'use cache'` |
| `cacheComponents: true` | Cache Components. Dynamic by default. Cache with `'use cache'` + `cacheLife` / `cacheTag`. Segment configs `dynamic` / `revalidate` / `fetchCache` **error**. PPR is the default behavior. Fetches inside a `'use cache'` scope are cached |

`'use cache'` requires `cacheComponents: true` ([use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)). Enabling the flag is a migration, not an automatic Next 16 default ([cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)).

Invalidation (both models, Next 16 signatures):

- `revalidateTag(tag, 'max')` — stale-while-revalidate; works in Server Actions and Route Handlers
- `updateTag(tag)` — expire and read fresh in the same request; Server Actions only
- `refresh()` — refresh uncached data only; Server Actions only
- `revalidatePath` — unchanged

## Next.js 16 idioms (do not generate Next 15)

- `proxy.ts` + `export function proxy` (Node) — not `middleware.ts` unless Edge is required
- Turbopack default — `next dev` / `next build` with no `--turbopack`. Opt out: `--webpack`
- `await params` / `await searchParams` / `await cookies()`
- `revalidateTag(tag, profile)` — not `revalidateTag(tag)`
- `reactCompiler: true` is stable and opt-in (not default)
- `turbopack: { ... }` at the Next config root — not `experimental.turbopack`
- Parallel route slots need `default.js` (build fails without it)

## How to review or refactor

When the user asks to review, refactor, modernize, or audit Next code, follow [`references/_review-algorithm.md`](references/_review-algorithm.md). Do not improvise.

1. Pick Mode A (≤~20 files) or Mode B (whole tree)
2. Detect cache model from `next.config` before Category 2
3. Category-major sweep with a scope declaration, per-category progress lines, and a coverage table
4. Category 9 last (dedup / consolidate / delete / demote `'use client'`)

## Rule categories

1. [Build & Bundle](references/_sections.md#1-build--bundle-optimization) — CRITICAL — barrels, `optimizePackageImports`, `serverExternalPackages`, Turbopack, `next/dynamic`
2. [Caching](references/_sections.md#2-caching-strategy) — CRITICAL — fetch intent, segment config **or** `'use cache'` (model-dependent), `revalidateTag`+profile, `revalidatePath`, React `cache()`
3. [Server Components](references/_sections.md#3-server-components--data-fetching) — HIGH — parallel fetch, Suspense, colocation, preload, no client initial fetch
4. [Routing](references/_sections.md#4-routing--navigation) — HIGH — parallel/intercepting routes, prefetch, `proxy.ts`, `notFound()`
5. [Server Actions](references/_sections.md#5-server-actions--mutations) — MEDIUM-HIGH — forms, `useFormStatus`, action results, optimistic UI, revalidation. Skip when mutations already go to an external API
6. [Streaming](references/_sections.md#6-streaming--loading-states) — MEDIUM — Suspense, `loading.tsx` on routes that await, `error.tsx`, matching skeletons
7. [Metadata](references/_sections.md#7-metadata--seo) — MEDIUM — `generateMetadata`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`
8. [Client islands](references/_sections.md#8-client-components) — LOW-MEDIUM — `'use client'` leaf, children slot, hydration, `next/script`
9. [Hygiene](references/_sections.md#9-codebase-hygiene) — CROSS-CUTTING — dedup fetchers, consolidate routes, dead code, boundary audit, name drift

Full rule list: [`references/compiled.md`](references/compiled.md). Rule files: [`references/`](references/).

## References

- [Next.js 16 blog](https://nextjs.org/blog/next-16)
- [Upgrade to 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Caching (Cache Components)](https://nextjs.org/docs/app/getting-started/caching)
- [Caching without Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components)
- [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [middleware → proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
