import { Pool, type PoolConfig } from 'pg'

type PgPoolInput = PoolConfig & { vercel?: boolean }

/** Vercel Postgres often presents a private CA; Node 24 + pg treat sslmode=require as verify-full. */
export function pgPoolConfig({
  vercel = Boolean(process.env.VERCEL),
  ssl,
  ...config
}: PgPoolInput): PoolConfig {
  if (ssl !== undefined) return { ...config, ssl }
  if (!vercel) return config
  return { ...config, ssl: { rejectUnauthorized: false } }
}

export function createPgPool(input: PgPoolInput): Pool {
  return new Pool(pgPoolConfig(input))
}
