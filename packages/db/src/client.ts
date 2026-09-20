import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import * as schema from './schema/index.js'

export type Db =
  | ReturnType<typeof drizzle<typeof schema>>
  | ReturnType<typeof drizzlePGLite<typeof schema>>

interface DbConfig {
  databaseUrl?: string
  pglite?: boolean
  pgliteInstance?: PGlite
}

interface DbRuntime {
  config: DbConfig | null
  db: Db | null
  pgLiteInstance: PGlite | null
  pgPool: Pool | null
}

function runtime(): DbRuntime {
  const g = globalThis as { __basilicDbRuntime?: DbRuntime }
  if (!g.__basilicDbRuntime)
    g.__basilicDbRuntime = { config: null, db: null, pgLiteInstance: null, pgPool: null }
  return g.__basilicDbRuntime
}

export function configureDb({ databaseUrl, pglite, pgliteInstance }: DbConfig): void {
  const state = runtime()
  state.config = { databaseUrl, pglite, pgliteInstance }
  state.db = null
}

function requireConfig(): DbConfig {
  const { config } = runtime()
  if (!config) throw new Error('configureDb() must be called before getDb()')
  return config
}

export function isPgliteConfigured(): boolean {
  return requireConfig().pglite === true
}

export function getPgliteClient(): PGlite | null {
  const state = runtime()
  const configured = state.config?.pgliteInstance ?? state.pgLiteInstance
  if (configured) return configured
  if (!state.db) return null
  return (state.db as unknown as { _: { session: { client: PGlite } } })._.session.client
}

export async function getDb(): Promise<Db> {
  const testOverride = (globalThis as { __basilicGetDb?: () => ReturnType<typeof loadDb> })
    .__basilicGetDb
  if (testOverride) return testOverride()
  return loadDb()
}

async function loadDb(): Promise<Db> {
  const state = runtime()
  if (state.db) return state.db

  const { databaseUrl, pglite, pgliteInstance } = requireConfig()
  if (pglite) {
    const instance = pgliteInstance ?? state.pgLiteInstance ?? new PGlite()
    if (!pgliteInstance && !state.pgLiteInstance) {
      await instance.waitReady
      state.pgLiteInstance = instance
    } else if (!state.pgLiteInstance && pgliteInstance) {
      state.pgLiteInstance = pgliteInstance
    }
    state.db = drizzlePGLite(instance, { schema })
    return state.db
  }

  if (!databaseUrl) throw new Error('DATABASE_URL is required when pglite is false')
  if (!state.pgPool) state.pgPool = new Pool({ connectionString: databaseUrl })
  state.db = drizzle(state.pgPool, { schema })
  return state.db
}

export function isDbReady(): boolean {
  return runtime().db !== null
}

export function resetDbInstance() {
  runtime().db = null
}

export async function closeDb() {
  const state = runtime()
  if (state.pgPool) {
    await state.pgPool.end()
    state.pgPool = null
  }
  if (state.pgLiteInstance && !state.config?.pgliteInstance) {
    await state.pgLiteInstance.close()
    state.pgLiteInstance = null
  }
  state.db = null
}
