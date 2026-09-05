import { describe, expect, it } from 'vitest'
import { mdxToMarkdown } from './snapshot-docs.js'

describe('mdxToMarkdown', () => {
  it('strips frontmatter and rewrites local doc links', () => {
    const markdown = mdxToMarkdown({
      source: `---
title: "Getting Started"
description: "Clone and run."
---

See [After fork](/docs/development/after-fork) and [Product Ready](/docs/testing/product-ready).
`,
      slug: 'development/index',
      outputSlugs: new Set(['development/after-fork.md', 'testing/product-ready.md']),
    })
    expect(markdown).toContain('# Getting Started')
    expect(markdown).toContain('Clone and run.')
    expect(markdown).toContain('](after-fork.md)')
    expect(markdown).toContain('](../testing/product-ready.md)')
    expect(markdown).not.toContain('---')
  })
})
