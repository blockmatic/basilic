import { captureError } from '@repo/error/node'
import { pathOnlyUrl } from '@repo/utils/logger/types'
import type { FastifyError, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  applyAcceptVary,
  negotiateAccept,
  renderNotFoundHtml,
  renderNotFoundMarkdown,
} from '../lib/agent/index.js'
import { mapHttpStatusToErrorCode, sendCatalogError } from '../lib/catalogs/mapper.js'
import { applyWwwAuthenticate, preferProblemJson } from '../lib/catalogs/problem.js'

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
  fastify.addHook('onSend', async (_request, reply, payload) => {
    applyWwwAuthenticate({ reply })
    return payload
  })

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

    return sendCatalogError({ reply, status: statusCode, code: errorCode })
  })

  fastify.setNotFoundHandler((request, reply) => {
    applyAcceptVary({ reply })
    const acceptHeader =
      typeof request.headers.accept === 'string' ? request.headers.accept : undefined
    const media = negotiateAccept({ acceptHeader })
    const wantsProblem = preferProblemJson({ acceptHeader })
    if (media === 'json' || (wantsProblem && media !== 'html' && media !== 'markdown'))
      return sendCatalogError({ reply, status: 404, code: 'NOT_FOUND' })
    if (media === 'markdown')
      return reply.code(404).type('text/markdown; charset=utf-8').send(renderNotFoundMarkdown())
    return reply.code(404).type('text/html; charset=utf-8').send(renderNotFoundHtml())
  })
}

export default fp(errorHandler)
