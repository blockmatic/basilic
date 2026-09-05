import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export function digestTree({ root }: { root: string }) {
  const hash = createHash('sha256')
  for (const path of listFiles({ root })) {
    hash.update(path)
    hash.update('\0')
    hash.update(readFileSync(join(root, path)))
    hash.update('\0')
  }
  return hash.digest('hex')
}

export function listFiles({ root, prefix = '' }: { root: string; prefix?: string }): string[] {
  const entries = readdirSync(join(root, prefix), { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  )
  const files: string[] = []
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...listFiles({ root, prefix: relative }))
      continue
    }
    if (entry.isFile()) files.push(relative)
  }
  return files
}
