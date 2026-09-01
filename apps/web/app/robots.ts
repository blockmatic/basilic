import type { MetadataRoute } from 'next'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/privacy', '/terms', '/auth/login'],
      disallow: '/',
    },
  }
}
