import { ApiHealthBadge } from '@/components/api-health-badge'
import { AuthBadge } from '@/components/auth-badge'
import { ChatAssistant } from './chat-assistant'
import { SignOutButton } from './sign-out-button'

type User = {
  email?: string | null
  name?: string | null
  emailVerified?: boolean | null
}

type DashboardContentProps = {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.email ?? user.name ?? 'User'}!
            </p>
          </div>
          <div className="flex gap-2">
            <ApiHealthBadge />
            <AuthBadge />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Email:</span>
              <p className="font-medium">{user.email ?? 'Not provided'}</p>
            </div>
            {user.name && (
              <div>
                <span className="text-muted-foreground text-sm">Name:</span>
                <p className="font-medium">{user.name}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground text-sm">Email Verified:</span>
              <p className="font-medium">{user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <SignOutButton />
          </div>
        </div>
      </div>
      <ChatAssistant />
    </div>
  )
}
