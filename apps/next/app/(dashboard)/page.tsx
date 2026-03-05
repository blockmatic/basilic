import { DashboardProfileSecurityContent } from 'app/(dashboard)/dashboard'
import { getAuthStatus, getUserInfo } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { authenticated } = await getAuthStatus()

  if (!authenticated) {
    redirect('/auth/login')
  }

  const user = await getUserInfo()
  return <DashboardProfileSecurityContent user={user ?? {}} />
}
