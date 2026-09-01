import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

const origin = env.NEXT_PUBLIC_APP_URL

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL('/privacy', origin).href, changeFrequency: 'yearly', priority: 0.3 },
    { url: new URL('/terms', origin).href, changeFrequency: 'yearly', priority: 0.3 },
    { url: new URL('/auth/login', origin).href, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
