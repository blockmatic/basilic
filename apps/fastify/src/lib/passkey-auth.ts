import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import { passkeyCredentials } from '../db/schema/index.js'

export type VerifyPasskeyAuthResult =
  | { ok: true; userId: string }
  | { ok: false; code: string; message: string }

export async function verifyPasskeyAuth({
  assertion,
  expectedChallenge,
  expectedOrigin,
  expectedRPID,
}: {
  assertion: AuthenticationResponseJSON
  expectedChallenge: string
  expectedOrigin: string
  expectedRPID: string
}): Promise<VerifyPasskeyAuthResult> {
  const credentialId = assertion.id
  if (!credentialId)
    return { ok: false, code: 'MISSING_CREDENTIAL_ID', message: 'Assertion missing credential id' }

  const db = await getDb()
  const [credential] = await db
    .select()
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.credentialId, credentialId))
    .limit(1)

  if (!credential) return { ok: false, code: 'UNKNOWN_CREDENTIAL', message: 'Credential not found' }

  const publicKey = Buffer.from(credential.publicKey, 'base64')
  const counter = Number.parseInt(credential.counter, 10)

  let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>
  try {
    verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: credential.credentialId,
        publicKey: new Uint8Array(publicKey),
        counter,
        transports: (credential.transports as AuthenticatorTransportFuture[] | null) ?? undefined,
      },
    })
  } catch (err) {
    return {
      ok: false,
      code: 'VERIFICATION_FAILED',
      message: err instanceof Error ? err.message : 'Verification failed',
    }
  }

  if (!verification.verified || !verification.authenticationInfo)
    return { ok: false, code: 'VERIFICATION_FAILED', message: 'Verification failed' }

  await db
    .update(passkeyCredentials)
    .set({ counter: String(verification.authenticationInfo.newCounter) })
    .where(eq(passkeyCredentials.id, credential.id))

  return { ok: true, userId: credential.userId }
}
