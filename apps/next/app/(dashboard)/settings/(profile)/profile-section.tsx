'use client'

import type { GetUserResponse } from '@repo/core'
import { useUser } from '@repo/react'
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
import { Skeleton } from '@repo/ui/components/skeleton'
import { useSetState } from 'ahooks'
import { User } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

type ProfileSectionProps = {
  /** Server-fetched user to avoid client fetch on initial paint */
  initialUser?: {
    email?: string | null
    name?: string | null
    emailVerified?: boolean | null
  } | null
}

export function ProfileSection({ initialUser }: ProfileSectionProps) {
  const { data, isLoading, isError, error } = useUser(
    initialUser != null ? { initialData: { user: initialUser } as GetUserResponse } : undefined,
  )
  const [state, setState] = useSetState<{ name: string | null }>({ name: null })

  useEffect(() => {
    if (data?.user?.name != null) setState({ name: String(data.user.name) })
  }, [data?.user?.name, setState])

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setState({ name: e.target.value }),
    [setState],
  )

  const handleSave = useCallback(() => {
    toast.info('Profile update coming soon')
  }, [])

  if (isLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )

  if (isError)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-destructive text-sm">{error?.message ?? 'Failed to load profile'}</p>
      </div>
    )

  const user = data?.user
  const email = user?.email != null ? String(user.email) : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-lg">
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
              onChange={handleNameChange}
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
          <Button onClick={handleSave}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
