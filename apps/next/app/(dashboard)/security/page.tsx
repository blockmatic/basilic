import { SecuritySection } from 'app/(dashboard)/security-section'
import { getAuthStatus } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'

export default async function SecurityPage() {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/auth/login')
  return <SecuritySection />
}
