export function userIdFromCtx({
  ctx,
}: {
  ctx: { session?: { auth?: { current?: { principalId?: string } | null } } }
}): string {
  const userId = ctx.session?.auth?.current?.principalId
  if (!userId) throw new Error('authenticated user required')
  return userId
}
