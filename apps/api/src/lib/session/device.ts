import type { FastifyRequest } from 'fastify'
import type { SignInMethod } from '../../db/schema/tables/sessions.js'
import { getTrustedClientIp } from '../request.js'

const browserLabels: Record<string, string> = {
  edge: 'Edge',
  opera: 'Opera',
  chrome: 'Chrome',
  firefox: 'Firefox',
  safari: 'Safari',
  unknown: 'Unknown browser',
}

const osLabels: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  unknown: 'unknown OS',
}

export function signInTypeLabel(method: SignInMethod): string {
  if (method === 'magic_link') return 'Email code'
  if (method === 'oauth_google') return 'Google'
  if (method === 'oauth_github') return 'GitHub'
  if (method === 'oauth_facebook') return 'Facebook'
  if (method === 'oauth_twitter') return 'X'
  if (method === 'passkey') return 'Passkey'
  if (method === 'web3_eip155') return 'Wallet (Ethereum)'
  return 'Wallet (Solana)'
}

function firstHeader(request: FastifyRequest, name: string): string | undefined {
  const raw = request.headers[name]
  if (Array.isArray(raw)) return raw[0]
  return typeof raw === 'string' ? raw : undefined
}

function decodeHeaderValue(value: string): string {
  try {
    return decodeURIComponent(value.replaceAll('+', ' '))
  } catch {
    return value
  }
}

function countryDisplayName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

export function locationFromRequest(request: FastifyRequest): string | undefined {
  const cityRaw =
    firstHeader(request, 'x-vercel-ip-city') ?? firstHeader(request, 'cf-ipcity') ?? undefined
  const countryRaw =
    firstHeader(request, 'x-vercel-ip-country') ?? firstHeader(request, 'cf-ipcountry') ?? undefined
  const city = cityRaw ? decodeHeaderValue(cityRaw).trim() : ''
  const countryCode = countryRaw?.trim() ?? ''
  const country = countryCode ? countryDisplayName(countryCode) : ''
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return undefined
}

export function parseUserAgent(userAgent: string | undefined): {
  deviceLabel: string
  fingerprint: string | null
} {
  const ua = userAgent?.trim() ?? ''
  if (!ua) return { deviceLabel: 'Unknown device', fingerprint: null }

  let browser = 'unknown'
  if (/Edg\//i.test(ua)) browser = 'edge'
  else if (/OPR\/|Opera/i.test(ua)) browser = 'opera'
  else if (/Chrome\//i.test(ua)) browser = 'chrome'
  else if (/Firefox\//i.test(ua)) browser = 'firefox'
  else if (/Safari\//i.test(ua)) browser = 'safari'

  let os = 'unknown'
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios'
  else if (/Android/i.test(ua)) os = 'android'
  else if (/Mac OS X/i.test(ua)) os = 'macos'
  else if (/Windows/i.test(ua)) os = 'windows'
  else if (/Linux/i.test(ua)) os = 'linux'

  const deviceLabel = `${browserLabels[browser] ?? 'Unknown browser'} on ${osLabels[os] ?? 'unknown OS'}`
  if (browser === 'unknown' && os === 'unknown') return { deviceLabel, fingerprint: null }

  return { deviceLabel, fingerprint: `${browser}|${os}` }
}

export function sessionDeviceFromRequest(request: FastifyRequest) {
  const userAgent = firstHeader(request, 'user-agent')
  const parsed = parseUserAgent(userAgent)
  return {
    ipAddress: getTrustedClientIp(request),
    userAgent: userAgent || undefined,
    location: locationFromRequest(request),
    deviceLabel: parsed.deviceLabel,
    deviceFingerprint: parsed.fingerprint,
  }
}
