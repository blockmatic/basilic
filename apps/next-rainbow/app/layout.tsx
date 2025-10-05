// Server API mocks - must be first import for SSR
import './server-mocks.js'
import type { Metadata } from 'next'
import { RootLayout } from '@/components/layout'

export default function Layout({ children }: LayoutProps) {
  return (
    // Note! If you do not add suppressHydrationWarning to your <html> you will get warnings
    // because next-themes updates that element. This property only applies one level deep,
    // so it won't block hydration warnings on other elements.
    <html lang="en" suppressHydrationWarning>
      <RootLayout>{children}</RootLayout>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'BasilicEVM',
  description: 'BasilicEVM dApp',
}

interface LayoutProps {
  children: React.ReactNode
}
