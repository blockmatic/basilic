import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DashboardWalletContent } from '@/components/dashboard/dashboard-wallet-content'
import { getAuthStatus, getUserInfo } from '@/lib/auth-utils'

export default async function DashboardPage() {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/login')

  const user = await getUserInfo()
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8">Loading…</div>}>
      <DashboardWalletContent user={user ?? {}} />
    </Suspense>
  )
}
