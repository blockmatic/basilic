import { ProfileSection } from 'app/(dashboard)/profile-section'
import { getAuthStatus, getUserInfo } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/auth/login')
  const user = await getUserInfo()
  return <ProfileSection user={user ?? undefined} />
}
