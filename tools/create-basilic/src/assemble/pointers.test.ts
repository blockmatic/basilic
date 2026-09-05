import { describe, expect, it } from 'vitest'
import { rewriteFilePointers } from './pointers.js'

describe('rewriteFilePointers', () => {
  it('rewrites canonical docs and FIRST pointers', () => {
    const next = rewriteFilePointers({
      path: 'AGENTS.md',
      content: [
        'Read [`apps/docu/content/docs/`](apps/docu/content/docs/) ',
        'and `_first/basilic/PRODUCT.md`.',
        'Also ../docu/content/docs/testing/product-ready.mdx',
      ].join('\n'),
    })
    expect(next).toContain('docs/basilic/')
    expect(next).toContain('_first/PRODUCT.md')
    expect(next).not.toContain('apps/docu/content/docs/')
    expect(next).not.toContain('_first/basilic/')
    expect(next).toContain('docs/basilic/testing/product-ready.md')
  })
})
