import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ReactNode } from 'react'
import './global.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { env } from '@/lib/env'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Basilic',
    template: '%s | Basilic',
  },
  description:
    'Portable architecture, a Fastify REST API with OpenAPI-generated clients, self-hosted Web2/Web3 auth, and a Cursor-first AI workflow.',
  openGraph: {
    title: 'Basilic',
    description:
      'Portable architecture, a Fastify REST API with OpenAPI-generated clients, self-hosted Web2/Web3 auth, and a Cursor-first AI workflow.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: 'dark' }} search={{ options: { api: '/api/search' } }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
