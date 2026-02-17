'use client'

import { useHealthCheck } from '@repo/react'
import { Badge } from '@repo/ui/components/badge'

export function ApiHealthBadge() {
  const { data, isLoading, isError } = useHealthCheck()

  if (isLoading) {
    return (
      <Badge variant="outline" data-testid="api-health-badge">
        Checking...
      </Badge>
    )
  }

  if (isError) {
    return (
      <Badge variant="destructive" data-testid="api-health-badge">
        API Down
      </Badge>
    )
  }

  if (data && typeof data === 'object' && 'ok' in data && data.ok === true) {
    return (
      <Badge variant="default" data-testid="api-health-badge">
        API OK
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" data-testid="api-health-badge">
      Unknown
    </Badge>
  )
}
