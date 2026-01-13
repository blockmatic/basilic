import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ComparisonTable } from '@/components/comparison-table'
import { Diagram } from '@/components/diagram'
import { DocsChart } from '@/components/docs-chart'
import { DocsVideo } from '@/components/docs-video'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Diagram,
    ComparisonTable,
    DocsVideo,
    DocsChart,
    ...components,
  } as MDXComponents
}
