import { appContract } from '@basilic/contracts'
import scalar from '@scalar/fastify-api-reference'
import { generateOpenApi } from '@ts-rest/open-api'
import type { FastifyPluginAsync } from 'fastify'

const openapi: FastifyPluginAsync = async fastify => {
  const openApiDocument = generateOpenApi(
    appContract,
    {
      info: {
        title: 'Basilic API',
        version: '1.0.0',
        description: 'Basilic API documentation',
      },
    },
    {
      setOperationId: true,
    },
  )

  // Register Scalar UI plugin with OpenAPI document
  await fastify.register(scalar, {
    routePrefix: '/reference',
    configuration: {
      content: openApiDocument,
    },
  })
}

export default openapi
