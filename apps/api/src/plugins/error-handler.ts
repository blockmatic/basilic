import { captureError } from '@repo/error/node'
import { pathOnlyUrl } from '@repo/utils/logger/types'
import type { FastifyError, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getError, mapHttpStatusToErrorCode } from '../lib/catalogs/mapper.js'

const pluralExceptions: Record<string, string> = {
  status: 'status',
  class: 'class',
  addresses: 'address',
  classes: 'class',
  statuses: 'status',
}

function extractModuleFromRoute(routePath: string): string | null {
  const match = routePath.match(/^\/([^/]+)/)
  if (!match) return null

  const resource = match[1]
  const singular = pluralExceptions[resource] ?? resource.replace(/s$/, '')
  return `${singular}-service`
}

const errorHandler: FastifyPluginAsync = async fastify => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const routePath: string =
      'routerPath' in request && typeof request.routerPath === 'string'
        ? request.routerPath
        : (request.url.split('?')[0] ?? '/')

    const module = extractModuleFromRoute(routePath) ?? 'api-route'
    const statusCode: number =
      typeof error.statusCode === 'number' && error.statusCode >= 100 && error.statusCode < 600
        ? error.statusCode
        : 500
    const errorCode = mapHttpStatusToErrorCode(statusCode)

    if (statusCode >= 500)
      captureError({
        code: errorCode,
        error,
        logger: request.log,
        label: `${request.method} ${routePath}`,
        data: {
          method: request.method,
          url: pathOnlyUrl(request.url),
        },
        tags: {
          app: 'api',
          module,
          route: routePath,
          method: request.method,
        },
      })

    const catalogError = getError(errorCode) ??
      getError('UNEXPECTED_ERROR') ?? {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
      }

    reply.status(statusCode).send({
      code: catalogError.code,
      message: catalogError.message,
    })
  })
}

export default fp(errorHandler)
