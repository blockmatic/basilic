'use client'

import { usePathname } from 'next/navigation'

export const pageTitles: Record<string, string> = {
  '/': 'Everything',
  '/markets': 'Markets',
  '/settings': 'Profile',
  '/settings/security': 'Authenticator',
  '/settings/security/passkeys': 'Passkeys',
  '/settings/security/api-keys': 'API keys',
}

export function PageTitle() {
  const pathname = usePathname()
  const title = pageTitles[pathname]
  if (!title) return null
  return <h1 className="font-heading truncate text-lg font-semibold md:text-xl">{title}</h1>
}
