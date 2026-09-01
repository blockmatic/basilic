import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/privacy', '/terms', '/auth/login', '/sitemap.xml'],
      disallow: '/',
    },
    sitemap: new URL('/sitemap.xml', env.NEXT_PUBLIC_APP_URL).href,
  }
}
