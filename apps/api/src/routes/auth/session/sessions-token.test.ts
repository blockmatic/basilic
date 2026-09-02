import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { getDb } from '../../../db/index.js'
import { sessions, users } from '../../../db/schema/index.js'
import { isUniqueViolation } from '../../../lib/db-errors.js'
import { hashToken } from '../../../lib/jwt.js'

describe('sessions.token uniqueness', () => {
  it('rejects duplicate refresh token hashes', async () => {
    const db = await getDb()
    const userId = randomUUID()
    await db.insert(users).values({
      id: userId,
      email: 'token-unique@test.ai',
      emailVerified: true,
      username: `token-${userId.slice(0, 8)}`,
    })

    const tokenHash = hashToken('duplicate-jti-value')
    const expiresAt = new Date(Date.now() + 60_000)

    await db.insert(sessions).values({
      id: randomUUID(),
      userId,
      token: tokenHash,
      expiresAt,
    })

    await expect(
      db.insert(sessions).values({
        id: randomUUID(),
        userId,
        token: tokenHash,
        expiresAt,
      }),
    ).rejects.toSatisfy(isUniqueViolation)
  })
})
