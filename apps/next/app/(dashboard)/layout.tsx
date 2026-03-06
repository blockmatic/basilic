import { Button } from '@repo/ui/components/button'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar'
import { Toaster } from '@repo/ui/components/sonner'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

import { DashboardSidebar } from './sidebar'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-5 md:gap-4 md:px-6">
          <div className="flex min-h-11 items-center md:hidden">
            <SidebarTrigger className="size-11 shrink-0" />
          </div>
          <div className="flex-1" />
          <div className="flex min-h-11 items-center gap-3 md:gap-4">
            <ApiHealthBadge />
            <AuthBadge />
            <Button
              variant="ghost"
              size="icon"
              className="size-11 sm:size-9"
              aria-label="Sign out"
              asChild
            >
              <Link href="/auth/logout">
                <LogOut />
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-5 md:p-6">{children}</main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
