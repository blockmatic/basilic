import type { FastifyReply } from 'fastify'

export type AcceptMedia = 'html' | 'markdown' | 'json' | 'none'

interface AcceptOffer {
  kind: AcceptMedia | 'star'
  q: number
}

function parseAcceptOffers({ acceptHeader }: { acceptHeader?: string }): AcceptOffer[] {
  const raw = acceptHeader?.trim()
  if (!raw) return [{ kind: 'star', q: 1 }]

  return raw.split(',').flatMap(part => {
    const [typeToken, ...params] = part.trim().split(';')
    const type = typeToken?.trim().toLowerCase()
    if (!type) return []
    const qToken = params.find(p => p.trim().toLowerCase().startsWith('q='))
    const q = qToken ? Number(qToken.trim().slice(2)) : 1
    if (!Number.isFinite(q) || q <= 0) return []
    if (type === '*/*' || type === 'text/*') return [{ kind: 'star', q }]
    if (type === 'text/html' || type === 'application/xhtml+xml') return [{ kind: 'html', q }]
    if (type === 'text/markdown' || type === 'text/x-markdown') return [{ kind: 'markdown', q }]
    if (type === 'application/json') return [{ kind: 'json', q }]
    return []
  })
}

export function negotiateAccept({ acceptHeader }: { acceptHeader?: string }): AcceptMedia {
  const offers = parseAcceptOffers({ acceptHeader })
  if (offers.length === 0) return 'none'

  const best = offers.reduce((winner, offer) => (offer.q > winner.q ? offer : winner))
  if (best.kind === 'star') return 'html'
  return best.kind
}

export function applyAcceptVary({ reply }: { reply: FastifyReply }): FastifyReply {
  return reply.header('Vary', 'Accept')
}

export function sendNotAcceptable({ reply }: { reply: FastifyReply }): FastifyReply {
  return applyAcceptVary({ reply })
    .code(406)
    .type('text/plain; charset=utf-8')
    .send('Not Acceptable')
}
