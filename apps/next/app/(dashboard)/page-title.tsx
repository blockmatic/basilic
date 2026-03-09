'use client'

import { usePathname, useSearchParams } from 'next/navigation'

export const pageTitles: Record<string, string> = {
  '/': 'Latest News',
  '/markets': 'Markets',
  '/settings': 'Profile',
  '/settings/security': 'Passkeys',
  '/settings/security/passkeys': 'Passkeys',
  '/settings/security/api-keys': 'API keys',
}

const securitySectionTitles: Record<string, string> = {
  passkeys: 'Passkeys',
  totp: 'Authenticator',
  apikeys: 'API keys',
  apikey: 'API keys',
}

export function PageTitle() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const section = searchParams.get('section') ?? ''
  let title = pageTitles[pathname]
  if (pathname === '/settings/security' && section)
    title = securitySectionTitles[section.toLowerCase()] ?? pageTitles[pathname]
  if (!title) return null
  return <h1 className="font-heading truncate text-lg font-semibold md:text-xl">{title}</h1>
}
