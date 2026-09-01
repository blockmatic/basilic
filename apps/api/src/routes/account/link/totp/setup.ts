import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { totpSetup } from '../../../../db/schema/index.js'
import {
  encryptTotpSecret,
  generateTotpSecret,
  generateTotpUri,
  getTotpIssuer,
  getTotpQrDataUrl,
} from '../../../../lib/totp.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const SetupResponseSchema = Type.Object({
  otpauthUri: Type.String(),
  manualEntryKey: Type.String(),
  qrCodeDataUrl: Type.String(),
})

const totpSetupRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/setup',
    {
      schema: {
        operationId: 'accountLinkTotpSetup',
        description: 'Start TOTP setup, returns QR and manual key',
        summary: 'TOTP setup',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        response: {
          200: SetupResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const userId = request.session.user.id
      const secret = generateTotpSecret()
      const encrypted = encryptTotpSecret(secret)
      if (!encrypted)
        return reply.code(500).send({
          code: 'SERVER_ERROR',
          message: 'Failed to encrypt secret',
        })

      const issuer = getTotpIssuer()
      const label = request.session.user.email ?? userId
      const otpauthUri = generateTotpUri({ secret, issuer, label })
      const qrCodeDataUrl = await getTotpQrDataUrl(otpauthUri)

      const manualEntryKey = secret.replace(/(.{4})/g, '$1-').replace(/-$/, '')

      const db = await getDb()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      const id = randomUUID()

      await db.delete(totpSetup).where(eq(totpSetup.userId, userId))
      await db.insert(totpSetup).values({
        id,
        userId,
        secretEncrypted: encrypted,
        expiresAt,
      })

      return reply.code(200).send({
        otpauthUri,
        manualEntryKey,
        qrCodeDataUrl,
      })
    },
  )
}

export default totpSetupRoute
export const prefixOverride = '/account/link/totp'
