import type { MetadataRoute } from 'next'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/auth/login', changeFrequency: 'monthly', priority: 0.5 },
  ]
}
