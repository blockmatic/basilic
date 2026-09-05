'use client'

import { usePathname } from 'next/navigation'

export const pageTitles: Record<string, string> = {
  '/': 'Markets',
  '/markets': 'Markets',
  '/settings': 'Profile',
  '/settings/security': 'Passkeys',
  '/settings/security/passkeys': 'Passkeys',
  '/settings/security/totp': 'Authenticator',
  '/settings/security/apikeys': 'API keys',
}

export function PageTitle(): React.JSX.Element | null {
  const pathname = usePathname()
  const title = pageTitles[pathname]
  if (!title) return null
  return <h1 className="font-heading truncate text-lg font-semibold md:text-xl">{title}</h1>
}
