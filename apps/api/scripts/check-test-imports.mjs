#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const apiRoot = dirname(scriptDir)
const srcRoot = join(apiRoot, 'src')

const walk = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async entry => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return walk(path)
      return path.endsWith('.test.ts') ? [path] : []
    }),
  )
  return files.flat()
}

const specFiles = await walk(srcRoot).then(files =>
  Promise.all(
    files.map(async file => ({
      file,
      content: await readFile(file, 'utf8'),
    })),
  ),
)

const specPaths = new Set()
for (const entry of await readdir(srcRoot, { recursive: true })) {
  if (typeof entry === 'string' && entry.endsWith('.spec.ts')) specPaths.add(join(srcRoot, entry))
}

const imported = new Set()
const importPattern = /import\s+['"](\.\.?\/[^'"]+\.test(?:\.(?:js|ts))?)['"]/g

for (const specPath of specPaths) {
  const content = await readFile(specPath, 'utf8')
  const dir = dirname(specPath)
  let match = importPattern.exec(content)
  while (match) {
    const raw = match[1].replace(/\.js$/, '')
    const testPath = raw.endsWith('.ts') ? join(dir, raw) : join(dir, `${raw}.ts`)
    imported.add(testPath)
    match = importPattern.exec(content)
  }
}

const orphans = specFiles.map(({ file }) => file).filter(file => !imported.has(file))

if (orphans.length > 0) {
  process.stderr.write('Orphan route test modules (not imported by any *.spec.ts):\n')
  for (const file of orphans) process.stderr.write(`  - ${relative(apiRoot, file)}\n`)
  process.exit(1)
}
