'use client'

import { useHealthCheck } from '@repo/react'
import { Badge } from '@repo/ui/components/badge'

export function ApiHealthBadge() {
  const { data, isLoading, isError } = useHealthCheck()

  if (isLoading) {
    return <Badge variant="outline">Checking...</Badge>
  }

  if (isError) {
    return <Badge variant="destructive">API Down</Badge>
  }

  if (data?.ok === true) {
    return <Badge variant="default">API OK</Badge>
  }

  return <Badge variant="secondary">Unknown</Badge>
}
