import { createRelativeLink } from 'fumadocs-ui/mdx'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import type { MDXComponents } from 'mdx/types'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { env } from '@/lib/env'
import { getPageImage, source } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

type PageParams = { slug?: string[] }

export default async function Page(props: { params: Promise<PageParams> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const Mdx = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <div className="mb-14">
          <Mdx
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page) as MDXComponents['a'],
            } as MDXComponents)}
          />
        </div>
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const origin = env.NEXT_PUBLIC_SITE_URL
  const ogImage = getPageImage(page).url

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: new URL(page.url, origin).href,
    },
    openGraph: {
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}
