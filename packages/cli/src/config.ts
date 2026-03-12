import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

export type Config = {
  apiKey?: string
  baseUrl?: string
}

function getConfigDir(): string {
  const envHome = process.env.XDG_CONFIG_HOME
  if (envHome) return join(envHome, 'basilic')
  const home = homedir()
  return platform() === 'win32'
    ? join(home, 'AppData', 'Local', 'basilic')
    : join(home, '.config', 'basilic')
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json')
}

export function loadConfig(): Config {
  const path = getConfigPath()
  if (!existsSync(path)) return {}
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : undefined,
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : undefined,
    }
  } catch {
    return {}
  }
}

export function saveConfig({ apiKey, baseUrl }: Partial<Config>): void {
  const path = getConfigPath()
  const dir = join(path, '..')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  const current = loadConfig()
  const next: Config = {
    ...current,
    ...(apiKey !== undefined && { apiKey }),
    ...(baseUrl !== undefined && { baseUrl }),
  }
  writeFileSync(path, JSON.stringify(next, null, 2), { encoding: 'utf-8', mode: 0o600 })
}

export function resolveApiKey(): string | undefined {
  return process.env.API_KEY ?? process.env.BASILIC_API_KEY ?? loadConfig().apiKey
}

export function resolveBaseUrl(): string {
  return (
    process.env.BASE_URL ?? process.env.API_URL ?? loadConfig().baseUrl ?? 'http://localhost:3000'
  )
}
