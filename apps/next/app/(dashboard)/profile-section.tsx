'use client'

import { Avatar, AvatarFallback } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useSetState } from 'ahooks'
import { User } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

type ProfileSectionProps = {
  user?: { email?: string | null; name?: string | null; emailVerified?: boolean | null } | null
}

export function ProfileSection({ user = null }: ProfileSectionProps) {
  const [state, setState] = useSetState<{ name: string | null }>({ name: null })

  useEffect(() => {
    if (user?.name != null) setState({ name: String(user.name) })
  }, [user?.name, setState])

  const email = user?.email != null ? String(user.email) : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback>
                <User className="size-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Avatar</p>
              <p className="text-muted-foreground text-xs">Display photo coming soon</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={String(state.name ?? user?.name ?? '')}
              onChange={e => setState({ name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email ?? ''}
              disabled
              readOnly
              className="bg-muted"
            />
            <p className="text-muted-foreground text-xs">Email cannot be changed</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => toast.info('Profile update coming soon')}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
