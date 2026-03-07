'use client'

import { KeyRoundIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/settings/security', label: 'Authenticator', icon: KeyRoundIcon },
  { href: '/settings/security/passkeys', label: 'Passkeys', icon: ShieldCheckIcon },
  { href: '/settings/security/api-keys', label: 'API keys', icon: TerminalIcon },
] as const

export default function SecurityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="flex flex-col gap-2 sm:flex-row sm:gap-4" aria-label="Security sections">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 min-w-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:min-h-0 sm:min-w-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
