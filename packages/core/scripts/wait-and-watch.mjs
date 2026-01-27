import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const openapiPath = join(scriptDir, '../../../apps/fastify/openapi/openapi.json')

function waitForFile() {
  if (existsSync(openapiPath)) {
    logger.info('✅ openapi.json found, starting watcher...')
    const child = exec(
      `chokidar "${openapiPath}" -c "pnpm generate" --initial`,
      { cwd: join(scriptDir, '..') },
      error => {
        if (error) {
          logger.error({ error }, '❌ Watcher error')
          process.exit(1)
        }
      },
    )
    child.stdout?.pipe(process.stdout)
    child.stderr?.pipe(process.stderr)
  } else {
    logger.info('⏳ Waiting for openapi.json...')
    setTimeout(waitForFile, 500)
  }
}

waitForFile()
