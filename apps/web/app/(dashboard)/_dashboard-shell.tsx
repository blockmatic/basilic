'use client'

import { Button } from '@repo/ui/components/button'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar'
import { useQueryClient } from '@tanstack/react-query'
import { AssistantSidebar } from 'components/assistant'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { authSessionJwtQueryKey, authSessionUserQueryKey } from '@/lib/query-keys'
import { PageTitle } from './page-title'
import { DashboardSidebar } from './sidebar'

export function DashboardShell({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const queryClient = useQueryClient()

  async function handleSignOut() {
    const response = await fetch('/auth/logout', { redirect: 'manual' })
    const isSuccess =
      response.type === 'opaqueredirect' ||
      response.status === 0 ||
      (response.status >= 200 && response.status < 400)
    if (!isSuccess) {
      toast.error('Sign out failed. Please try again.')
      return
    }
    queryClient.invalidateQueries({ queryKey: authSessionUserQueryKey })
    queryClient.invalidateQueries({ queryKey: authSessionJwtQueryKey })
    window.location.href = '/'
  }

  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
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
                type="button"
                onClick={handleSignOut}
              >
                <LogOut />
              </Button>
            </div>
          </header>
          <div className="flex min-h-0 flex-1" style={{ height: 'calc(100dvh - 3.5rem)' }}>
            <ScrollArea orientation="vertical" className="min-h-0 min-w-0 w-0 flex-1">
              <main className="block p-4 md:p-6">{children}</main>
            </ScrollArea>
            <AssistantSidebar />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
