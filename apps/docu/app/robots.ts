import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

const origin = env.NEXT_PUBLIC_SITE_URL

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs', '/og', '/llms.txt', '/llms-full.txt', '/sitemap.xml'],
      disallow: '/api/',
    },
    sitemap: new URL('/sitemap.xml', origin).href,
  }
}
