/** Extract Postgres error code from Drizzle/Driver error (23505 = unique violation) */
export function getPgErrorCode(err: unknown): string | undefined {
  return (
    (err as { cause?: { code?: string }; code?: string }).cause?.code ??
    (err as { code?: string }).code
  )
}

export function isUniqueViolation(err: unknown): boolean {
  return getPgErrorCode(err) === '23505'
}
