'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/sidebar'
import { Toaster } from '@repo/ui/components/sonner'
import { SignOutButton } from 'app/(dashboard)/sign-out-button'
import { ChatAssistant } from 'components/assistant'
import { ApiHealthBadge } from 'components/shared/api-health-badge'
import { AuthBadge } from 'components/shared/auth-badge'
import { ShieldIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Dashboard</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Profile">
                    <Link href="/">
                      <UserIcon />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/security')}
                    tooltip="Security"
                  >
                    <Link href="/security">
                      <ShieldIcon />
                      <span>Security</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-5 md:gap-4 md:px-6">
          <div className="flex min-h-11 items-center md:hidden">
            <SidebarTrigger className="size-11 shrink-0" />
          </div>
          <div className="flex-1" />
          <div className="flex min-h-11 items-center gap-3 md:gap-4">
            <ApiHealthBadge />
            <AuthBadge />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-5 md:p-6">{children}</main>
        <ChatAssistant />
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
