import { getDb } from "@repo/db";
import { passkeyCredentials } from "@repo/db/schema";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { and, eq } from "drizzle-orm";

import { getError } from "../catalogs/mapper.js";
import type { ErrorCode } from "../catalogs/mapper.js";

const validTransports = [
  "ble",
  "cable",
  "hybrid",
  "internal",
  "nfc",
  "smart-card",
  "usb",
] as const;
type AuthenticatorTransportFuture = (typeof validTransports)[number];

function filterTransports(
  arr: string[] | null
): AuthenticatorTransportFuture[] | undefined {
  if (!arr?.length) {
    return undefined;
  }
  const set = new Set(validTransports);
  return arr.filter((t): t is AuthenticatorTransportFuture =>
    set.has(t as AuthenticatorTransportFuture)
  );
}

export type VerifyPasskeyAuthResult =
  | { ok: true; userId: string }
  | { ok: false; code: ErrorCode };

function catalogFailure(code: ErrorCode): { ok: false; code: ErrorCode } {
  getError(code);
  return { code, ok: false };
}

export async function verifyPasskeyAuth({
  assertion,
  expectedChallenge,
  expectedOrigin,
  expectedRPID,
}: {
  assertion: AuthenticationResponseJSON;
  expectedChallenge: string;
  expectedOrigin: string;
  expectedRPID: string;
}): Promise<VerifyPasskeyAuthResult> {
  const credentialId = assertion.id;
  if (!credentialId) {
    return catalogFailure("MISSING_CREDENTIAL_ID");
  }

  const db = await getDb();
  const [credential] = await db
    .select()
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.credentialId, credentialId))
    .limit(1);

  if (!credential) {
    return catalogFailure("UNKNOWN_CREDENTIAL");
  }

  const publicKey = Buffer.from(credential.publicKey, "base64");
  const { counter } = credential;
  if (!Number.isInteger(counter) || Number.isNaN(counter) || counter < 0) {
    return catalogFailure("INVALID_COUNTER");
  }

  let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
  try {
    verification = await verifyAuthenticationResponse({
      credential: {
        counter,
        id: credential.credentialId,
        publicKey: new Uint8Array(publicKey),
        transports: filterTransports(credential.transports) ?? undefined,
      },
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      response: assertion,
    });
  } catch {
    return catalogFailure("VERIFICATION_FAILED");
  }

  if (!verification.verified || !verification.authenticationInfo) {
    return catalogFailure("VERIFICATION_FAILED");
  }

  const [updated] = await db
    .update(passkeyCredentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(
      and(
        eq(passkeyCredentials.id, credential.id),
        eq(passkeyCredentials.counter, counter)
      )
    )
    .returning();

  if (!updated) {
    return catalogFailure("COUNTER_UPDATE_FAILED");
  }

  return { ok: true, userId: credential.userId };
}
