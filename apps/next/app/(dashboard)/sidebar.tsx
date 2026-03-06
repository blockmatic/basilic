'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar'
import { BarChart3Icon, NewspaperIcon, ShieldIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'News', icon: NewspaperIcon },
  { href: '/markets', label: 'Markets', icon: BarChart3Icon },
] as const

const settingsItems = [
  { href: '/settings', label: 'Profile', icon: UserIcon },
  { href: '/settings/security', label: 'Security', icon: ShieldIcon },
] as const

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
