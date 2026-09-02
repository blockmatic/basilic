import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { source } from '@/lib/source'

export const revalidate = false

const origin = env.NEXT_PUBLIC_SITE_URL

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map(page => ({
    url: new URL(page.url, origin).href,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [{ url: new URL('/', origin).href, changeFrequency: 'monthly', priority: 1 }, ...pages]
}
