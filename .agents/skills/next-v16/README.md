# Next.js 16 App Router Best Practices

Comprehensive performance optimization guide for Next.js 16 App Router applications.

## Overview

This skill contains **45 rules across 9 categories** (including codebase hygiene) for optimizing Next.js 16 App Router applications. Rules are prioritized by impact from CRITICAL to LOW-MEDIUM.

Next.js 16 has **two cache models**: with `cacheComponents` unset/false, use the previous fetch-cache model (`cache: 'force-cache'`, `next.revalidate`, segment config). With `cacheComponents: true`, use `'use cache'` + `cacheLife` / `cacheTag`. Detect which model the app uses before generating cache APIs.

### Structure

```text
next-v16/
├── SKILL.md              # Entry point with quick reference
├── metadata.json         # Version and references
├── README.md             # This file
└── references/
    ├── compiled.md       # Compiled comprehensive guide
    ├── _sections.md      # Category definitions
    ├── _review-algorithm.md
    └── {prefix}-{slug}.md # Individual rules
```

## Getting Started

From the basilic-skills repo root:

```bash
pnpm validate
```

## Creating a New Rule

1. Choose the appropriate category prefix from `references/_sections.md`
2. Create a new file: `references/{prefix}-{descriptive-name}.md`
3. Follow the template structure below
4. Run `pnpm validate` to ensure compliance

### Prefix Reference

| Category | Prefix | Impact |
|----------|--------|--------|
| Build & Bundle Optimization | `build-` | CRITICAL |
| Caching Strategy | `cache-` | CRITICAL |
| Server Components & Data Fetching | `server-` | HIGH |
| Routing & Navigation | `route-` | HIGH |
| Server Actions & Mutations | `action-` | MEDIUM-HIGH |
| Streaming & Loading States | `stream-` | MEDIUM |
| Metadata & SEO | `meta-` | MEDIUM |
| Client Components | `client-` | LOW-MEDIUM |
| Codebase Hygiene | `cross-` | CROSS-CUTTING |

## Rule File Structure

```markdown
---
title: Rule Title Here
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified impact (e.g., "2-10× improvement")
tags: prefix, technique, tool
---

## Rule Title Here

Brief explanation of WHY this matters (1-3 sentences).

**Incorrect (description of problem):**

\`\`\`typescript
// Bad code example
\`\`\`

**Correct (description of solution):**

\`\`\`typescript
// Good code example
\`\`\`

Reference: [Link](https://example.com)
```

## File Naming Convention

Rule files follow the pattern: `{prefix}-{descriptive-slug}.md`

Examples:
- `build-dynamic-imports.md`
- `cache-use-cache-directive.md`
- `server-parallel-fetching.md`

## Impact Levels

| Level | Description |
|-------|-------------|
| CRITICAL | Fundamental issues that cause major performance problems |
| HIGH | Significant optimizations with measurable impact |
| MEDIUM-HIGH | Important patterns for common scenarios |
| MEDIUM | Useful optimizations for specific cases |
| LOW-MEDIUM | Minor improvements and best practices |
| LOW | Edge cases and advanced patterns |

## Scripts

```bash
# Validate skill structure and content (from basilic-skills repo root)
pnpm validate
```

## Contributing

1. Follow the rule template exactly
2. Include both incorrect and correct examples
3. Quantify impact where possible
4. Reference authoritative sources
5. Run `pnpm validate` before submitting

## Acknowledgments

Based on official Next.js documentation and Vercel engineering best practices.
