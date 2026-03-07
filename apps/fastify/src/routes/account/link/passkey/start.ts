import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import {
  generateRegistrationOptions,
  type PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/server'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { passkeyChallenges, passkeyCredentials } from '../../../../db/schema/index.js'
import { getWebAuthnOriginFromRequest } from '../../../../lib/passkey.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const StartResponseSchema = Type.Object({
  options: Type.Any(),
})

const passkeyStartRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/start',
    {
      schema: {
        operationId: 'accountLinkPasskeyStart',
        description: 'Start passkey registration, returns options for startRegistration',
        summary: 'Passkey registration start',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        response: {
          200: StartResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const origin = getWebAuthnOriginFromRequest(request.headers.origin)
      if (!origin)
        return reply.code(400).send({
          code: 'INVALID_ORIGIN',
          message: 'Invalid or missing Origin header',
        })

      const userId = request.session.user.id
      const userName = request.session.user.email ?? userId

      const db = await getDb()

      const existingPasskeys = await db
        .select({ credentialId: passkeyCredentials.credentialId })
        .from(passkeyCredentials)
        .where(eq(passkeyCredentials.userId, userId))

      const excludeCredentials = existingPasskeys.map(p => ({
        id: p.credentialId,
        transports: [] as (
          | 'internal'
          | 'usb'
          | 'nfc'
          | 'ble'
          | 'cable'
          | 'hybrid'
          | 'smart-card'
        )[],
      }))

      const userIDBytes = new TextEncoder().encode(userId)
      const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
        rpName: 'Acme Inc.',
        rpID: origin.rpID,
        userName,
        userID: userIDBytes,
        attestationType: 'none',
        excludeCredentials: excludeCredentials.length > 0 ? excludeCredentials : undefined,
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
        },
      })

      await db.delete(passkeyChallenges).where(eq(passkeyChallenges.userId, userId))

      const challengeId = randomUUID()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
      const challengeStr =
        typeof options.challenge === 'string'
          ? options.challenge
          : Buffer.from(options.challenge).toString('base64url')
      await db.insert(passkeyChallenges).values({
        id: challengeId,
        userId,
        challenge: challengeStr,
        expiresAt,
      })

      return reply.code(200).send({ options })
    },
  )
}

export default passkeyStartRoute
export const prefixOverride = '/account/link/passkey'
