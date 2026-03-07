import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { type Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyAuthChallenges } from '../../../db/schema/index.js'
import { getWebAuthnOriginFromRequest } from '../../../lib/passkey.js'
import { PublicKeyCredentialRequestOptionsJSONSchema } from '../../../lib/schemas/webauthn.js'
import { ErrorResponseSchema } from '../../schemas.js'

const challengeMaxAge = 5 * 60 // 5 minutes

const StartResponseSchema = Type.Object({
  options: PublicKeyCredentialRequestOptionsJSONSchema,
  sessionId: Type.String(),
})

const passkeyStartRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/start',
    {
      schema: {
        operationId: 'authPasskeyStart',
        description: 'Start passkey authentication, returns options for startAuthentication',
        summary: 'Passkey auth start',
        tags: ['auth'],
        security: [],
        response: {
          200: StartResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const origin = getWebAuthnOriginFromRequest(request.headers.origin)
      if (!origin)
        return reply.code(400).send({
          code: 'INVALID_ORIGIN',
          message: 'Invalid or missing Origin header',
        })

      const sessionId = randomUUID()
      const options = await generateAuthenticationOptions({
        rpID: origin.rpID,
        userVerification: 'required',
        allowCredentials: [],
      })

      const db = await getDb()
      const challengeStr =
        typeof options.challenge === 'string'
          ? options.challenge
          : Buffer.from(options.challenge).toString('base64url')
      const expiresAt = new Date(Date.now() + challengeMaxAge * 1000)
      await db.insert(passkeyAuthChallenges).values({
        id: randomUUID(),
        sessionId,
        challenge: challengeStr,
        expiresAt,
      })

      return reply.code(200).send({
        options: options as Static<typeof PublicKeyCredentialRequestOptionsJSONSchema>,
        sessionId,
      })
    },
  )
}

export default passkeyStartRoute
export const prefixOverride = '/auth/passkey'
