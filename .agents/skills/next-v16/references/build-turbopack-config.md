---
title: Don't disable Turbopack's persistent caching — the defaults are what give 5-10× faster restarts
impact: CRITICAL
impactDescription: 5-10× faster cold starts on large apps when persistent caching stays on; disabling it is the most common Next.js 16 perf regression
tags: build, turbopack, persistent-cache, config-regression
---

## Don't disable Turbopack's persistent caching — the defaults are what give 5-10× faster restarts

**Pattern intent:** Next.js 16's Turbopack is the default bundler and ships persistent file-system caching enabled by default (`experimental.turbopackFileSystemCacheForDev` / `experimental.turbopackFileSystemCacheForBuild`). The fast restart story depends on it. Configurations that toggle the cache off silently drop the win.

### Shapes to recognize

- `experimental.turbopackFileSystemCacheForDev: false` in `next.config.{js,ts,mjs}` — kills the persistent cache.
- `experimental.turbo.persistentCaching: false` — not the Next 16 API; use the `turbopackFileSystemCache*` flags instead.
- A `.gitignore` rule excluding `.next/cache/turbopack` *plus* CI clearing `.next` between builds — guarantees a cold start every dev session locally, every build remotely.
- A pre-`dev`/pre-`build` script doing `rm -rf .next` "to be safe" — defeats the cache.
- Custom `webpack` configuration that conflicts with Turbopack — use `--webpack` to opt out, or migrate loaders to top-level `turbopack.rules`.
- A `next` invocation explicitly passing `--no-turbopack` somewhere in package.json scripts — silently downgrades.
- A Docker dev image that doesn't mount `.next/cache` as a volume — re-creates the cache every container start.

The canonical resolution: leave filesystem cache on by default. Use top-level `turbopack: { rules }` for custom loaders. Mount `.next/cache` if running in containers. Stop running pre-build clean steps in dev workflows.

Reference: [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)

**Incorrect (disabling Turbopack filesystem cache):**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}
```

**Correct (leveraging Turbopack defaults):**

```typescript
// next.config.ts
const nextConfig = {
  // Turbopack is default in Next.js 16 — no --turbopack flag needed
  // Filesystem caching is on by default
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
```

**Development command:**

```bash
# Turbopack is the default bundler
next dev

# Opt out only when webpack config is still required
next dev --webpack
```

**Note:** Turbopack caches to `.next/cache/turbopack`. Don't add this to `.gitignore` locally for persistent caching across restarts.

Reference: [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
