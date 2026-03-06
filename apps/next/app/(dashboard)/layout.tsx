import { Button } from '@repo/ui/components/button'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar'
import { Toaster } from '@repo/ui/components/sonner'
import { AssistantSidebar } from 'components/assistant'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

import { PageTitle } from './page-title'
import { DashboardSidebar } from './sidebar'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1">
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:gap-4 md:px-6">
            <div className="flex min-h-11 items-center md:hidden">
              <SidebarTrigger className="size-11 shrink-0" />
            </div>
            <div className="flex min-w-0 flex-1 items-center">
              <PageTitle />
            </div>
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
                <Link href="/auth/logout" prefetch={false}>
                  <LogOut />
                </Link>
              </Button>
            </div>
          </header>
          <div className="flex min-h-0 flex-1" style={{ height: 'calc(100dvh - 3.5rem)' }}>
            <main className="min-w-0 w-0 flex-1 overflow-auto p-4 md:p-6">{children}</main>
            <AssistantSidebar />
          </div>
        </SidebarInset>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
