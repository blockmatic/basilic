import { cpSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const apiRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const from = join(apiRoot, 'src/db/migrations')
const to = join(apiRoot, 'dist/src/db/migrations')
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
