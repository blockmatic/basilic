import { initContract } from '@ts-rest/core'
import { HealthResponseSchema } from '../schemas/health.schema.js'

const c = initContract()

export const appContract = c.router({
  health: {
    check: {
      method: 'GET',
      path: '/health',
      responses: {
        200: HealthResponseSchema,
      },
      summary: 'Health check endpoint',
      description: 'Returns server health status with current ISO datetime',
    },
  },
})
