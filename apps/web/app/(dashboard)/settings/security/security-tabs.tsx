'use client'

import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { cn } from '@repo/ui/lib/utils'
import { KeyRoundIcon, MonitorIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/settings/security/sessions',
    value: 'sessions',
    icon: MonitorIcon,
    label: 'Sessions',
  },
  {
    href: '/settings/security/passkeys',
    value: 'passkeys',
    icon: ShieldCheckIcon,
    label: 'Passkeys',
  },
  { href: '/settings/security/totp', value: 'totp', icon: KeyRoundIcon, label: 'Authenticator' },
  { href: '/settings/security/apikeys', value: 'apikeys', icon: TerminalIcon, label: 'API keys' },
] as const

const triggerStyles = 'min-w-0'

function getActiveValue(pathname: string) {
  if (pathname.endsWith('/totp')) return 'totp'
  if (pathname.endsWith('/apikeys')) return 'apikeys'
  if (pathname.endsWith('/sessions')) return 'sessions'
  return 'passkeys'
}

export function SecurityTabs() {
  const pathname = usePathname()
  const active = getActiveValue(pathname)

  return (
    <Tabs value={active} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 [&>[data-slot=tabs-trigger]]:min-w-0">
        {tabs.map(({ href, value, icon: Icon, label }) => (
          <TabsTrigger key={value} value={value} asChild>
            <Link
              href={href}
              aria-current={active === value ? 'page' : undefined}
              className={cn(triggerStyles)}
            >
              <Icon />
              <span className="truncate">{label}</span>
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
