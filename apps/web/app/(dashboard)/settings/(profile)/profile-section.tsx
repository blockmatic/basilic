'use client'

import type { GetUserResponse } from '@repo/core'
import { useProfileUpdate, useUser } from '@repo/react'
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Skeleton } from '@repo/ui/components/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip'
import { useSetState } from 'ahooks'
import { Copy, Shuffle, User } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { ChangeEmailBlock } from './change-email-block'
import { LinkedAccountsSection } from './linked-accounts-section'

const adjectives = [
  'clever',
  'swift',
  'brave',
  'cosmic',
  'lucky',
  'happy',
  'quick',
  'bright',
  'fancy',
  'royal',
]
const animals = ['panda', 'fox', 'owl', 'bear', 'wolf', 'lion', 'tiger', 'eagle', 'otter', 'hawk']

function generateFunnyUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj}_${animal}`
}

function buildSavePayload(
  state: { name: string | null; username: string | null },
  user: { name?: string | null; username?: string | null } | null | undefined,
): { name?: string; username?: string | null } {
  const payload: { name?: string; username?: string | null } = {}
  const userName = user?.name != null ? String(user.name) : null
  const userUsername = user?.username != null ? String(user.username) : null
  const name = state.name
  if (typeof name === 'string' && name !== '' && name !== userName) payload.name = name
  if (state.username !== undefined && state.username !== userUsername)
    payload.username = state.username || null
  return payload
}

function ProfileFormContent({
  state,
  user,
  setState,
  formDirty,
  userId,
  onSave,
  onCopyId,
  onGenerateUsername,
  isSaving,
}: {
  state: { name: string | null; username: string | null }
  user: { id?: string; name?: string | null; username?: string | null; email?: string | null }
  setState: (patch: Record<string, string | null | undefined>) => void
  formDirty: boolean
  userId: string | null
  onSave: () => void
  onCopyId: () => void
  onGenerateUsername: () => void
  isSaving: boolean
}) {
  const email = user?.email != null ? String(user.email) : null
  return (
    <div className="space-y-6">
      <section className="space-y-4 border-b pb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Username</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your unique identifier. Used in profile URLs and API interactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={String(state.username ?? user?.username ?? '')}
            onChange={e => setState({ username: e.target.value })}
            placeholder="e.g. clever_fox"
            maxLength={48}
            className="font-mono"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Generate username"
                onClick={onGenerateUsername}
              >
                <Shuffle className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate a funny username</TooltipContent>
          </Tooltip>
          {formDirty && (
            <Button variant="outline" onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">Please use 48 characters at maximum.</p>
      </section>

      <section className="space-y-4 border-b pb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Display name</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your visible name shown to other users.
          </p>
        </div>
        <Input
          value={String(state.name ?? user?.name ?? '')}
          onChange={e => setState({ name: e.target.value })}
          placeholder="Your name"
          maxLength={32}
        />
        <p className="text-muted-foreground text-xs">Please use 32 characters at maximum.</p>
      </section>

      <section className="space-y-4 border-b pb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Email</h2>
          <p className="text-muted-foreground mt-1 text-sm">Your primary email address.</p>
        </div>
        <ChangeEmailBlock email={email} />
      </section>

      <LinkedAccountsSection />

      <section className="space-y-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback>
              <User className="size-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-heading font-semibold">Avatar</h2>
            <p className="text-muted-foreground text-sm">
              Add an avatar to personalize your profile.
            </p>
            <p className="text-muted-foreground text-xs">An avatar is optional but recommended.</p>
          </div>
        </div>
      </section>

      {userId && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-heading font-semibold">User ID</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              This is your user ID within the system.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            <code className="flex-1 truncate font-mono text-sm">{userId}</code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Copy user ID"
                  onClick={onCopyId}
                >
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy to clipboard</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-muted-foreground text-xs">Used when interacting with the API.</p>
        </section>
      )}
    </div>
  )
}

type ProfileSectionProps = {
  initialUser?: {
    id?: string
    email?: string | null
    name?: string | null
    username?: string | null
    emailVerified?: boolean | null
  } | null
}

export function ProfileSection({ initialUser }: ProfileSectionProps) {
  const { data, isLoading, isError, error } = useUser(
    initialUser != null ? { initialData: { user: initialUser } as GetUserResponse } : undefined,
  )
  const updateMutation = useProfileUpdate()
  const [state, setState] = useSetState<{ name: string | null; username: string | null }>({
    name: null,
    username: null,
  })

  useEffect(() => {
    if (data?.user?.name != null) setState({ name: String(data.user.name) })
  }, [data?.user?.name, setState])
  useEffect(() => {
    if (data?.user?.username != null) setState({ username: String(data.user.username) })
  }, [data?.user?.username, setState])

  const user = data?.user
  const userForForm = useMemo(
    () =>
      user != null
        ? {
            id: user.id,
            name: user.name != null ? String(user.name) : null,
            username: user.username != null ? String(user.username) : null,
            email: user.email != null ? String(user.email) : null,
          }
        : { id: undefined as string | undefined, name: null, username: null, email: null },
    [user],
  )
  const formDirty =
    (state.name ?? '') !== (userForForm.name ?? '') ||
    (state.username ?? '') !== (userForForm.username ?? '')
  const userId = userForForm.id != null ? String(userForForm.id) : null

  const handleSave = useCallback(async () => {
    if (!formDirty) return
    const payload = buildSavePayload(state, userForForm)
    if (Object.keys(payload).length === 0) return
    try {
      await updateMutation.mutateAsync(payload)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }, [formDirty, state, userForForm, updateMutation])

  const handleCopyId = useCallback(async () => {
    if (!userId || !navigator.clipboard) {
      toast.error('Clipboard not available')
      return
    }
    try {
      await navigator.clipboard.writeText(userId)
      toast.success('Copied to clipboard')
    } catch (err) {
      toast.error(`Failed to copy: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [userId])

  const handleGenerateUsername = useCallback(
    () => setState({ username: generateFunnyUsername() }),
    [setState],
  )

  if (isLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )

  if (isError)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-destructive text-sm">{error?.message ?? 'Failed to load profile'}</p>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProfileFormContent
        state={state}
        user={userForForm}
        setState={patch =>
          setState(prev => ({
            ...prev,
            ...(patch.name !== undefined && { name: patch.name ?? null }),
            ...(patch.username !== undefined && { username: patch.username ?? null }),
          }))
        }
        formDirty={formDirty}
        userId={userId}
        onSave={handleSave}
        onCopyId={handleCopyId}
        onGenerateUsername={handleGenerateUsername}
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}
