import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { getAuthStatus, getUserInfo } from '@/lib/auth-utils'

export default async function Home() {
  const { authenticated } = await getAuthStatus()

  if (!authenticated) {
    redirect('/login')
  }

  const user = await getUserInfo()
  return <DashboardContent user={user ?? {}} />
}
