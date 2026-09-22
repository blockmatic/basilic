import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ReactNode } from 'react'
import './global.css'
import type { Metadata } from 'next'
import { Geist_Mono, Inter, Poppins } from 'next/font/google'
import { env } from '@/lib/env'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const siteTitle = 'Basilic · Vercel-oriented agentic product foundation'
const siteDescription =
  'Own the API. Hang web, mobile, and coding agents off it. Fastify OpenAPI, eve, Next.js client — built around the Vercel ecosystem, portable Node and Postgres.'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: siteTitle,
    template: '%s | Basilic',
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${fontMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider theme={{ defaultTheme: 'dark' }} search={{ options: { api: '/api/search' } }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
