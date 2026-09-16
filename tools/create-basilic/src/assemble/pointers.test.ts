import { describe, expect, it } from 'vitest'
import { rewriteFilePointers } from './pointers.js'

describe('rewriteFilePointers', () => {
  it('rewrites canonical docs pointers to the local snapshot', () => {
    const next = rewriteFilePointers({
      path: 'AGENTS.md',
      content: [
        'Read [`apps/docu/content/docs/`](apps/docu/content/docs/) ',
        'and `_first/basilic/PRODUCT.md`.',
        'Also ../docu/content/docs/testing/product-ready.mdx',
      ].join('\n'),
    })
    expect(next).toContain('docs/basilic/')
    expect(next).toContain('PRODUCT.md')
    expect(next).not.toContain('apps/docu/content/docs/')
    expect(next).not.toContain('_first/')
    expect(next).toContain('docs/basilic/testing/product-ready.md')
  })

  it('rewrites GEMINI.md the same way as AGENTS.md', () => {
    const next = rewriteFilePointers({
      path: 'GEMINI.md',
      content: 'See apps/docu/content/docs/development/ai-workflow.mdx',
    })
    expect(next).toContain('docs/basilic/development/ai-workflow.mdx')
    expect(next).not.toContain('apps/docu/content/docs/')
  })
})
