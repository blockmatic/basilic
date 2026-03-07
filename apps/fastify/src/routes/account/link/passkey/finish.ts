import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { passkeyChallenges, passkeyCredentials } from '../../../../db/schema/index.js'
import { getWebAuthnOriginFromRequest } from '../../../../lib/passkey.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const FinishBodySchema = Type.Object({
  credential: Type.Any(),
})

const FinishResponseSchema = Type.Object({
  ok: Type.Literal(true),
})

const passkeyFinishRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/finish',
    {
      schema: {
        operationId: 'accountLinkPasskeyFinish',
        description: 'Finish passkey registration, verify and store credential',
        summary: 'Passkey registration finish',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: FinishBodySchema,
        response: {
          200: FinishResponseSchema,
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

      const { credential } = request.body
      const userId = request.session.user.id

      const db = await getDb()
      const [challengeRow] = await db
        .select()
        .from(passkeyChallenges)
        .where(eq(passkeyChallenges.userId, userId))
        .orderBy(passkeyChallenges.expiresAt)

      if (!challengeRow || challengeRow.expiresAt < new Date())
        return reply.code(400).send({
          code: 'EXPIRED_CHALLENGE',
          message: 'Registration challenge expired or not found',
        })

      const verification = await verifyRegistrationResponse({
        response: credential as RegistrationResponseJSON,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin: origin.expectedOrigin,
        expectedRPID: origin.rpID,
      })

      if (!verification.verified || !verification.registrationInfo)
        return reply.code(400).send({
          code: 'VERIFICATION_FAILED',
          message: 'Passkey verification failed',
        })

      const { credential: cred } = verification.registrationInfo
      const credentialIdStr = cred.id
      const publicKeyB64 = Buffer.from(cred.publicKey).toString('base64')

      await db.delete(passkeyChallenges).where(eq(passkeyChallenges.id, challengeRow.id))

      const id = randomUUID()
      const name = `Passkey ${id.slice(0, 8)}`
      await db.insert(passkeyCredentials).values({
        id,
        userId,
        credentialId: credentialIdStr,
        publicKey: publicKeyB64,
        counter: String(cred.counter),
        name,
      })

      return reply.code(200).send({ ok: true })
    },
  )
}

export default passkeyFinishRoute
export const prefixOverride = '/account/link/passkey'
