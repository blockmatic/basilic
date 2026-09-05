import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { listFiles } from '../digest.js'

const pointerGlobs = [
  'AGENTS.md',
  'CLAUDE.md',
  '.cursor/rules/',
  '.agents/',
  'apps/',
  'packages/',
  'scripts/',
  '_first/',
]

const skipRewrite = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|zip|gz|tgz|wasm|mp4|sqlite3?)$/i

export function rewritePointers({ destRoot }: { destRoot: string }) {
  for (const path of listFiles({ root: destRoot })) {
    if (!shouldRewrite({ path })) continue
    const abs = join(destRoot, path)
    const original = readFileSync(abs, 'utf8')
    const next = rewriteFilePointers({ path, content: original })
    if (next !== original) writeFileSync(abs, next)
  }
}

export function rewriteFilePointers({ path, content }: { path: string; content: string }) {
  let next = content
  next = next.replaceAll('apps/docu/content/docs/', 'docs/basilic/')
  next = next.replaceAll('@apps/docu/content/docs/', 'docs/basilic/')
  next = next.replaceAll('apps/docu/content/docs', 'docs/basilic')
  next = next.replaceAll('_first/basilic/PRODUCT.md', '_first/PRODUCT.md')
  next = next.replaceAll('_first/basilic/', '_first/')
  next = next.replaceAll('globs: "apps/docu/**/*.mdx"', 'globs: "docs/basilic/**/*.md"')
  next = rewriteRelativeDocuLinks({ path, content: next })
  return next
}

function shouldRewrite({ path }: { path: string }) {
  if (path.startsWith('docs/basilic/')) return false
  if (skipRewrite.test(path)) return false
  return pointerGlobs.some(rule => path === rule || path.startsWith(rule) || path.endsWith(rule))
}

function rewriteRelativeDocuLinks({ path, content }: { path: string; content: string }) {
  return content.replace(
    /(\.\.\/)+docu\/content\/docs\/([^\s)"'`]+)/g,
    (_full, _dots, slug: string) => {
      const target = `docs/basilic/${slug.replace(/\.mdx$/, '.md')}`
      return relative(dirname(path), target)
    },
  )
}
