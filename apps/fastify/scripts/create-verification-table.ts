#!/usr/bin/env node
import 'dotenv/config'
import { captureError } from '@repo/sentry/node'
import { logger } from '@repo/utils/logger'
import { Pool } from 'pg'
import { env } from '../src/lib/env.js'

const pool = new Pool({ connectionString: env.DATABASE_URL })

async function createVerificationTable() {
  try {
    // Check if table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification'
      )
    `)

    if (checkResult.rows[0]?.exists) {
      logger.info('Verification table already exists')
      await pool.end()
      return
    }

    // Create the table
    await pool.query(`
      CREATE TABLE "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)

    // Create indexes
    await pool.query(`
      CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
    `)

    await pool.query(`
      CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");
    `)

    logger.info('Verification table created successfully')
  } catch (error) {
    captureError({
      code: 'INTERNAL_ERROR',
      error: error instanceof Error ? error : new Error(String(error)),
      logger,
      label: 'createVerificationTable failed',
      tags: { app: 'api', module: 'db-migration' },
    })
    throw error
  } finally {
    await pool.end()
  }
}

createVerificationTable().catch(error => {
  captureError({
    code: 'INTERNAL_ERROR',
    error: error instanceof Error ? error : new Error(String(error)),
    logger,
    label: 'createVerificationTable script failed',
    tags: { app: 'api', module: 'db-migration' },
  })
  process.exit(1)
})
