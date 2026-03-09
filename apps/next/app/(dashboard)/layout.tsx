import { getAuthStatus } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'

import { DashboardShell } from './_dashboard-shell'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/auth/login')
  return <DashboardShell>{children}</DashboardShell>
}
