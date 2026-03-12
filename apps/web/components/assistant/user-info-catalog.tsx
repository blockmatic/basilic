'use client'

import { defineCatalog } from '@json-render/core'
import { defineRegistry, schema } from '@json-render/react'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { Card } from '@repo/ui/components/card'
import { cn } from '@repo/ui/lib/utils'
import { z } from 'zod'

export const userInfoCatalog = defineCatalog(schema, {
  components: {
    UserInfo: {
      props: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        joinedAt: z.string(),
        image: z.string().nullable(),
        username: z.string().nullable(),
      }),
      description: 'Account info card with avatar, name, email, username, joined date',
    },
  },
  actions: {},
})

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    const first = parts[0]
    const last = parts.at(-1)
    if (parts.length >= 2 && first && last) return `${first[0]}${last[0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

function UserInfoComponent({
  props,
}: {
  props: {
    name: string | null
    email: string | null
    joinedAt: string
    image: string | null
    username: string | null
  }
}) {
  return (
    <Card
      data-testid="user-info-card"
      className={cn(
        'flex flex-row items-center gap-3 rounded-lg border py-3 px-4 shadow-sm',
        'animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out',
        '[@media(prefers-reduced-motion:reduce)]:animate-none',
      )}
    >
      <Avatar className="size-10 shrink-0">
        {props.image ? <AvatarImage src={props.image} alt={props.name ?? ''} /> : null}
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {getInitials(props.name, props.email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5">
        {props.name ? <p className="font-medium truncate">{props.name}</p> : null}
        {props.username ? (
          <p className="text-muted-foreground text-sm truncate">@{props.username}</p>
        ) : null}
        {props.email ? (
          <p className="text-muted-foreground text-sm truncate">{props.email}</p>
        ) : null}
        <p className="text-muted-foreground text-sm">Joined {props.joinedAt}</p>
      </div>
    </Card>
  )
}

export const { registry: userInfoRegistry } = defineRegistry(userInfoCatalog, {
  components: { UserInfo: UserInfoComponent },
})
