import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../env.js'
import { applyAgentDiscoveryHeaders } from './links.js'
import { negotiateAccept, sendNotAcceptable } from './negotiate.js'

const title = 'Basilic Fastify API'

function trimSlash({ url }: { url: string }): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function getLandingUrls(): {
  docs: string
  privacy: string
  terms: string
  cli: string
} {
  const docs = trimSlash({ url: env.DOCS_SITE_URL })
  const web = trimSlash({ url: env.WEB_APP_URL })
  return {
    docs,
    privacy: `${web}/privacy`,
    terms: `${web}/terms`,
    cli: `${docs}/docs/development/packages`,
  }
}

function landingProse({ docs }: { docs: string }): string {
  return [
    `${title} is a Fastify 5 host that exposes a typed REST API.`,
    'Routes and TypeBox schemas are the source of truth for validation and for OpenAPI generation.',
    'Human browsers can open Scalar at /reference. Agents should prefer this landing page, markdown negotiation, and the OpenAPI document.',
    'Readiness is GET /health. Session and API-key auth are documented on the docs site.',
    `Adopter documentation lives at ${docs}. This process is the product API, not a second documentation site.`,
    'Unknown paths return HTTP 404. JSON clients receive the catalog code NOT_FOUND. HTML and markdown clients receive a short recovery body with discovery links.',
    'Public discovery files are /robots.txt, /sitemap.xml, /llms.txt, /.well-known/api-catalog, and /.well-known/oauth-protected-resource.',
  ].join(' ')
}

function resourceLinks({
  docs,
  privacy,
  terms,
  cli,
}: ReturnType<typeof getLandingUrls>): { href: string; label: string }[] {
  return [
    { href: '/reference', label: 'API reference (Scalar)' },
    { href: '/openapi.json', label: 'OpenAPI document' },
    { href: '/health', label: 'Health' },
    { href: '/llms.txt', label: 'llms.txt' },
    { href: '/robots.txt', label: 'robots.txt' },
    { href: docs, label: 'Documentation' },
    { href: privacy, label: 'Privacy' },
    { href: terms, label: 'Terms' },
    { href: cli, label: 'CLI package' },
  ]
}

export function renderLandingMarkdown(): string {
  const urls = getLandingUrls()
  const links = resourceLinks(urls)
    .map(item => `- [${item.label}](${item.href})`)
    .join('\n')
  return [
    `# ${title}`,
    '',
    '## What this host is',
    '',
    landingProse({ docs: urls.docs }),
    '',
    '## Resources',
    '',
    links,
    '',
  ].join('\n')
}

export function renderLandingHtml(): string {
  const urls = getLandingUrls()
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: title,
    description: landingProse({ docs: urls.docs }),
    documentation: urls.docs,
    termsOfService: urls.terms,
  })
  const items = resourceLinks(urls)
    .map(item => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join('')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="is-agentic-site-type" content="app">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <h1>${title}</h1>
  <h2>What this host is</h2>
  <p>${landingProse({ docs: urls.docs })}</p>
  <h2>Resources</h2>
  <ul>${items}</ul>
</body>
</html>`
}

export function sendLandingPage({
  request,
  reply,
}: {
  request: FastifyRequest
  reply: FastifyReply
}): FastifyReply {
  applyAgentDiscoveryHeaders({ reply })
  const media = negotiateAccept({
    acceptHeader: typeof request.headers.accept === 'string' ? request.headers.accept : undefined,
  })
  if (media === 'markdown')
    return reply.type('text/markdown; charset=utf-8').send(renderLandingMarkdown())
  if (media === 'html') return reply.type('text/html; charset=utf-8').send(renderLandingHtml())
  return sendNotAcceptable({ reply })
}

export function renderNotFoundMarkdown(): string {
  return [
    '# Not found',
    '',
    'This path is not a route on Basilic Fastify API.',
    '',
    '- [Home](/)',
    '- [llms.txt](/llms.txt)',
    '- [sitemap.xml](/sitemap.xml)',
    '- [OpenAPI](/openapi.json)',
    '',
  ].join('\n')
}

export function renderNotFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Not found</title>
</head>
<body>
  <h1>Not found</h1>
  <p>This path is not a route on Basilic Fastify API.</p>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/llms.txt">llms.txt</a></li>
    <li><a href="/sitemap.xml">sitemap.xml</a></li>
    <li><a href="/openapi.json">OpenAPI</a></li>
  </ul>
</body>
</html>`
}

export function renderReferenceMarkdown({ openApiUrl }: { openApiUrl: string }): string {
  return [
    '# API reference',
    '',
    'Scalar is an interactive OpenAPI explorer for this Fastify host. It needs JavaScript.',
    `Agents should read the OpenAPI document at ${openApiUrl} instead of the Scalar shell.`,
    '',
  ].join('\n')
}
