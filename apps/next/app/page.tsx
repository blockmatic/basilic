import { redirect } from 'next/navigation'
import { DashboardWalletContent } from '@/components/dashboard/dashboard-wallet-content'
import { getAuthStatus, getUserInfo } from '@/lib/auth-utils'

export default async function Home() {
  const { authenticated } = await getAuthStatus()

  if (!authenticated) {
    redirect('/login')
  }

  const user = await getUserInfo()
  return <DashboardWalletContent user={user ?? {}} />
}
