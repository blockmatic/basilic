/**
 * @deprecated Magic link email is now stored in localStorage (client-only).
 * Use useLastMagicLinkEmail from last-magic-link-email-client for prefill.
 * This function always returns undefined.
 */
export async function getLastMagicLinkEmail(): Promise<string | undefined> {
  return undefined
}
