import { userIdFromAuth } from './account-scope.js'

export function userIdFromCtx({
  ctx,
}: {
  ctx: {
    session?: {
      auth?: { current?: { principalId?: string; principalType?: string } | null }
    }
  }
}): string {
  const userId = userIdFromAuth({ ctx })
  if (!userId) throw new Error('authenticated user required')
  return userId
}
