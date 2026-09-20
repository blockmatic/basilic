import { cpSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const from = join(packageRoot, 'src/migrations')
const to = join(packageRoot, 'dist/migrations')
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
