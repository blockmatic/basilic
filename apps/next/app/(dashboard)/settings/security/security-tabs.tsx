'use client'

import { Tabs, TabsList } from '@repo/ui/components/tabs'
import { cn } from '@repo/ui/lib/utils'
import { KeyRoundIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/settings/security/passkeys',
    value: 'passkeys',
    icon: ShieldCheckIcon,
    label: 'Passkeys',
  },
  { href: '/settings/security/totp', value: 'totp', icon: KeyRoundIcon, label: 'Authenticator' },
  { href: '/settings/security/apikeys', value: 'apikeys', icon: TerminalIcon, label: 'API keys' },
] as const

const triggerStyles =
  "inline-flex h-[calc(100%-1px)] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-[color,box-shadow] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function getActiveValue(pathname: string) {
  if (pathname.endsWith('/totp')) return 'totp'
  if (pathname.endsWith('/apikeys')) return 'apikeys'
  return 'passkeys'
}

export function SecurityTabs() {
  const pathname = usePathname()
  const active = getActiveValue(pathname)

  return (
    <Tabs value={active} className="w-full">
      <TabsList className="grid w-full grid-cols-3 [&>[data-slot=tabs-trigger]]:min-w-0">
        {tabs.map(({ href, value, icon: Icon, label }) => (
          <Link
            key={value}
            href={href}
            role="tab"
            aria-selected={active === value}
            aria-current={active === value ? 'page' : undefined}
            data-slot="tabs-trigger"
            data-state={active === value ? 'active' : 'inactive'}
            className={cn(triggerStyles)}
          >
            <Icon />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
}
