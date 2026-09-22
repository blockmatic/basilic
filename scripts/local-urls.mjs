#!/usr/bin/env node
/**
 * Canonical Portless names and HTTPS .localhost URLs for local Basilic apps.
 * Bind ports are an implementation detail. Agents should use these names.
 */
import { spawnSync } from 'node:child_process'

export const localServices = [
  {
    id: 'web',
    name: 'basilic',
    url: 'https://basilic.localhost',
    label: 'Web',
    hint: 'login test@test.ai',
  },
  {
    id: 'api',
    name: 'api.basilic',
    url: 'https://api.basilic.localhost',
    label: 'API',
    hint: 'GET /health, /reference',
  },
  {
    id: 'docu',
    name: 'docu.basilic',
    url: 'https://docu.basilic.localhost',
    label: 'Docs',
    hint: '',
  },
  {
    id: 'email',
    name: 'email.basilic',
    url: 'https://email.basilic.localhost',
    label: 'Email preview',
    hint: '',
  },
  {
    id: 'agents',
    name: 'agents.basilic',
    url: 'https://agents.basilic.localhost',
    label: 'Eve',
    hint: '/eve/command and /eve/chat',
  },
]

export const canonicalLocalAppUrls = Object.fromEntries(
  localServices.map(service => [service.id, service.url]),
)

export function namedHttpsUrl({ url, fallback }) {
  try {
    const hostname = new URL(url).hostname
    if (!hostname.endsWith('.localhost')) return fallback
    return `https://${hostname}`
  } catch {
    return fallback
  }
}

export function portlessGetUrl({ name, spawn = spawnSync, cwd, env = process.env } = {}) {
  const result = spawn('pnpm', ['exec', 'portless', 'get', name], {
    cwd,
    env,
    encoding: 'utf-8',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) return null
  const url = result.stdout?.trim()
  if (!url?.startsWith('http')) return null
  return url
}

export function resolveLocalAppUrls({ spawn = spawnSync, cwd, env = process.env } = {}) {
  const urls = { ...canonicalLocalAppUrls }
  for (const service of localServices) {
    const resolved = portlessGetUrl({ name: service.name, spawn, cwd, env })
    if (resolved) urls[service.id] = namedHttpsUrl({ url: resolved, fallback: service.url })
  }
  return urls
}

export function formatLocalUrlBanner({ urls = canonicalLocalAppUrls } = {}) {
  const lines = ['Local apps (Portless HTTPS):']
  for (const service of localServices) {
    const url = urls[service.id] ?? service.url
    const hint = service.hint ? `  (${service.hint})` : ''
    lines.push(`  ${service.label}: ${url}${hint}`)
  }
  lines.push('Escape hatch: pnpm --filter <pkg> dev:app   Bypass: PORTLESS=0')
  return lines.join('\n')
}

export function eveAgentUrl({ origin, id }) {
  return `${String(origin).replace(/\/$/, '')}/eve/${id}`
}

export function localDevChildEnv({ env = process.env, urls = canonicalLocalAppUrls } = {}) {
  return {
    ...env,
    NEXT_PUBLIC_APP_URL: urls.web,
    NEXT_PUBLIC_API_URL: urls.api,
    WEB_APP_URL: urls.web,
    EVE_COMMAND_URL: eveAgentUrl({ origin: urls.agents, id: 'command' }),
    EVE_CHAT_URL: eveAgentUrl({ origin: urls.agents, id: 'chat' }),
    NEXT_PUBLIC_SITE_URL: urls.docu,
    EXPO_PUBLIC_API_URL: urls.api,
  }
}
