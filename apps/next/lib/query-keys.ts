/** Query keys matching @repo/react auth hooks (useUser, useSession). Used for invalidation only. */
export const authSessionUserQueryKey = ['auth', 'session', 'user'] as const
export const authSessionJwtQueryKey = ['auth', 'session', 'jwt'] as const
