import { ChatAssistant } from 'components/assistant'
import { getUserInfo } from 'lib/auth/auth-utils'

import { ProfileSection } from './profile-section'

export default async function SettingsPage() {
  const user = await getUserInfo()
  return (
    <>
      <ProfileSection initialUser={user ?? undefined} />
      <ChatAssistant />
    </>
  )
}
