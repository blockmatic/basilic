import fs from 'node:fs'
import path from 'node:path'

const pkgPath = path.resolve(process.cwd(), 'package.json')
const tempPath = path.resolve(process.cwd(), '.package-originals.json')

if (!fs.existsSync(tempPath)) {
  // No originals stored, skip restore
  process.exit(0)
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const originals = JSON.parse(fs.readFileSync(tempPath, 'utf8'))

// Restore original exports (handle null/undefined)
if (originals.exports !== null) {
  pkg.exports = JSON.parse(originals.exports)
} else {
  delete pkg.exports
}

if (originals.main !== null) {
  pkg.main = originals.main
} else {
  delete pkg.main
}

if (originals.types !== null) {
  pkg.types = originals.types
} else {
  delete pkg.types
}

delete pkg.files

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
fs.unlinkSync(tempPath)
