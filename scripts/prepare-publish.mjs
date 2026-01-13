import fs from 'node:fs'
import path from 'node:path'

const pkgPath = path.resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Store original exports for postpack restore
const originalExports = pkg.exports ? JSON.stringify(pkg.exports) : null
const originalMain = pkg.main || null
const originalTypes = pkg.types || null

// Switch exports from src to dist for publishing
pkg.exports = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
  },
}

pkg.main = './dist/index.js'
pkg.types = './dist/index.d.ts'
pkg.files = ['dist']

// Store originals in a temp file for postpack
const tempPath = path.resolve(process.cwd(), '.package-originals.json')
fs.writeFileSync(
  tempPath,
  JSON.stringify({ exports: originalExports, main: originalMain, types: originalTypes }),
)

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
