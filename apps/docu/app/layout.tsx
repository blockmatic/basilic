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
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: 'dark' }} search={{ options: { type: 'fetch' } }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
