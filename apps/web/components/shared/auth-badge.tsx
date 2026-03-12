'use client'

import { useUser } from '@repo/react'
import { Badge } from '@repo/ui/components/badge'

export function AuthBadge() {
  const { data, isLoading, isError } = useUser()

  if (isLoading) return <Badge variant="outline">Checking...</Badge>

  if (isError) return <Badge variant="secondary">Signed Out</Badge>

  if (data?.user) return <Badge variant="default">Signed In</Badge>

  return <Badge variant="secondary">Signed Out</Badge>
}
