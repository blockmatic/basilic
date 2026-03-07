import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import { passkeyCredentials } from '../db/schema/index.js'

const validTransports = ['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'] as const
type AuthenticatorTransportFuture = (typeof validTransports)[number]

function filterTransports(arr: string[] | null): AuthenticatorTransportFuture[] | undefined {
  if (!arr?.length) return undefined
  const set = new Set(validTransports)
  return arr.filter((t): t is AuthenticatorTransportFuture =>
    set.has(t as AuthenticatorTransportFuture),
  )
}

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
  const counter = credential.counter
  if (!Number.isInteger(counter) || Number.isNaN(counter) || counter < 0)
    return {
      ok: false,
      code: 'INVALID_COUNTER',
      message: 'Invalid credential counter',
    }

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
        transports: filterTransports(credential.transports) ?? undefined,
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

  const [updated] = await db
    .update(passkeyCredentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeyCredentials.id, credential.id))
    .returning()

  if (!updated)
    return {
      ok: false,
      code: 'COUNTER_UPDATE_FAILED',
      message: 'Failed to update credential counter',
    }

  return { ok: true, userId: credential.userId }
}
