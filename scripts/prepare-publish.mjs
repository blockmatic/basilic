import fs from 'node:fs'
import path from 'node:path'

const pkgPath = path.resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// Store original exports for postpack restore
const originalExports = pkg.exports ? JSON.stringify(pkg.exports) : null
const originalMain = pkg.main || null
const originalTypes = pkg.types || null

function toDistPath(srcPath) {
  if (!srcPath || !srcPath.startsWith('./src/')) return srcPath
  return srcPath.replace('./src/', './dist/').replace(/\.tsx?$/, '.js')
}

function toDistTypesPath(srcPath) {
  if (!srcPath || !srcPath.startsWith('./src/')) return srcPath
  return srcPath.replace('./src/', './dist/').replace(/\.tsx?$/, '.d.ts')
}

function transformExportValue(value) {
  if (typeof value === 'string') {
    return value.startsWith('./src/') ? toDistPath(value) : value
  }
  if (typeof value === 'object' && value !== null) {
    const importPath =
      (value.import ?? value.default) && (value.import ?? value.default).startsWith('./src/')
        ? toDistPath(value.import ?? value.default)
        : (value.import ?? value.default)
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (k === 'source') continue
      if (k === 'import' && typeof v === 'string') {
        out.import = v.startsWith('./src/') ? toDistPath(v) : v
      } else if (k === 'types' && typeof v === 'string') {
        out.types = importPath?.startsWith('./dist/')
          ? importPath.replace(/\.js$/, '.d.ts')
          : v.startsWith('./src/')
            ? toDistTypesPath(v)
            : v
      } else if ((k === 'browser' || k === 'node' || k === 'default') && typeof v === 'string') {
        out[k] = v.startsWith('./src/') ? toDistPath(v) : v
      } else {
        out[k] = v
      }
    }
    return out
  }
  return value
}

if (pkg.exports && typeof pkg.exports === 'object') {
  const transformed = {}
  for (const [key, value] of Object.entries(pkg.exports)) {
    transformed[key] = transformExportValue(value)
  }
  pkg.exports = transformed
}

const hasRootExport = pkg.exports?.['.']
if (hasRootExport) {
  const root = pkg.exports['.']
  const rootObj = typeof root === 'object' ? root : { import: root }
  pkg.main = rootObj.import || rootObj.default || './dist/index.js'
  pkg.types = rootObj.types || './dist/index.d.ts'
} else {
  delete pkg.main
  delete pkg.types
}

pkg.files = ['dist']

// Store originals in a temp file for postpack restore
const tempPath = path.resolve(process.cwd(), '.package-originals.json')
fs.writeFileSync(
  tempPath,
  JSON.stringify({ exports: originalExports, main: originalMain, types: originalTypes }),
)

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
