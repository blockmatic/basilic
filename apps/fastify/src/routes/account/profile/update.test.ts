import { getOrCreateSession } from '@test/utils/auth-helper.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { fastify } from '../account.spec.js'

describe('PATCH /account/profile', () => {
  let jwt: string
  let otherJwt: string

  beforeAll(async () => {
    jwt = await getOrCreateSession(fastify, 'phase2-shared@test.ai')
    otherJwt = await getOrCreateSession(fastify, 'phase2-other@test.ai')
  })

  it('should return 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      payload: { name: 'New Name' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('UNAUTHORIZED')
  })

  it('should return 200 with name update', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { name: 'Updated Name' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.user.name).toBe('Updated Name')
  })

  it('should return 200 with username update', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { username: 'valid_user_99' },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).user.username).toBe('valid_user_99')
  })

  it('should return 409 when username is taken', async () => {
    await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${otherJwt}` },
      payload: { username: 'taken_by_other_user' },
    })
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { username: 'taken_by_other_user' },
    })
    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).code).toBe('USERNAME_TAKEN')
  })

  it('should return 400 for invalid username pattern', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/account/profile',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { username: 'invalid!@#' },
    })
    expect(res.statusCode).toBe(400)
  })
})
