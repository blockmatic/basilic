'use client'

import { ChatAssistant } from 'components/assistant'
import { ProfileSection } from 'components/dashboard/profile-section'
import { SecuritySection } from 'components/dashboard/security-section'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

const tabParser = parseAsStringLiteral(['profile', 'security']).withDefault('profile')

type User = {
  email?: string | null
  name?: string | null
  emailVerified?: boolean | null
}

type DashboardContentProps = {
  user: User
}

export function DashboardWalletContent({ user: _user }: DashboardContentProps) {
  const [tab] = useQueryState('tab', tabParser)

  return (
    <>
      {tab === 'profile' && <ProfileSection />}
      {tab === 'security' && <SecuritySection />}
      <ChatAssistant />
    </>
  )
}
