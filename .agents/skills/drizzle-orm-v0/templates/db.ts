/**
 * Drizzle ORM Database Connection Template
 *
 * Usage:
 * 1. Copy this file to src/db/index.ts
 * 2. Uncomment the connection method you need
 * 3. Set DATABASE_URL in .env
 */

// === NEON SERVERLESS (HTTP) ===
// Best for: Edge functions, serverless, one-shot queries
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required')

const sql = neon(databaseUrl)
export const db = drizzle(sql, { schema })

// === NEON SERVERLESS (WebSocket) ===
// Best for: Transactions, connection pooling
// import { Pool } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-serverless";
//
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool, { schema });

// === NODE POSTGRES ===
// Best for: Traditional server environments
// import { Pool } from "pg";
// import { drizzle } from "drizzle-orm/node-postgres";
//
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool, { schema });

// === POSTGRES.JS ===
// Best for: Modern Node.js servers
// import postgres from "postgres";
// import { drizzle } from "drizzle-orm/postgres-js";
//
// const databaseUrl = process.env.DATABASE_URL;
// if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required');
// const client = postgres(databaseUrl);
// export const db = drizzle(client, { schema });
