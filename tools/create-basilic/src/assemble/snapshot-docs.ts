import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'

const docsHost = 'https://basilic-docs.vercel.app/docs'

export function snapshotDocs({ sourceRoot, destRoot }: { sourceRoot: string; destRoot: string }) {
  const mdxRoot = join(sourceRoot, 'apps/docu/content/docs')
  const outRoot = join(destRoot, 'docs/basilic')
  const mdxFiles = listMdx({ dir: mdxRoot })
  const outputSlugs = new Set(mdxFiles.map(file => file.replace(/\.mdx$/, '.md')))

  for (const file of mdxFiles) {
    const source = readFileSync(join(mdxRoot, file), 'utf8')
    const markdown = mdxToMarkdown({
      source,
      slug: file.replace(/\.mdx$/, ''),
      outputSlugs,
    })
    const dest = join(outRoot, file.replace(/\.mdx$/, '.md'))
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, markdown)
  }

  return { pages: mdxFiles.length }
}

function listMdx({ dir, prefix = '' }: { dir: string; prefix?: string }): string[] {
  const entries = readdirSync(join(dir, prefix), { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...listMdx({ dir, prefix: relativePath }))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(relativePath)
  }
  return files.sort((left, right) => left.localeCompare(right))
}

export function mdxToMarkdown({
  source,
  slug,
  outputSlugs,
}: {
  source: string
  slug: string
  outputSlugs: Set<string>
}) {
  const { title, description, body } = splitFrontmatter(source)
  let markdown = body.replace(/^import\s.+;?\s*$/gm, '')
  markdown = rewriteHrefAndMarkdownLinks({ markdown, slug, outputSlugs })
  markdown = stripJsx(markdown)
  const heading = title ? `# ${title}\n\n` : ''
  const lead = description ? `${description}\n\n` : ''
  return `${heading}${lead}${markdown.trim()}\n`
}

function splitFrontmatter(source: string) {
  if (!source.startsWith('---\n')) return { title: undefined, description: undefined, body: source }
  const end = source.indexOf('\n---\n', 4)
  if (end === -1) return { title: undefined, description: undefined, body: source }
  const raw = source.slice(4, end)
  const body = source.slice(end + 5)
  const title = raw.match(/^title:\s*"?([^"\n]+)"?\s*$/m)?.[1]
  const description = raw.match(/^description:\s*"?([^"\n]+)"?\s*$/m)?.[1]
  return { title, description, body }
}

function rewriteHrefAndMarkdownLinks({
  markdown,
  slug,
  outputSlugs,
}: {
  markdown: string
  slug: string
  outputSlugs: Set<string>
}) {
  const fromDir = dirname(`docs/basilic/${slug}.md`)
  const toLocal = (targetSlug: string) => {
    const local = resolveLocalDoc({ targetSlug, outputSlugs })
    if (!local) return `${docsHost}/${targetSlug}`
    return posix.relative(fromDir, `docs/basilic/${local}`) || posix.basename(local)
  }

  return markdown
    .replaceAll(/\]\(\/docs\/([a-z0-9\-_/]+)\)/g, (_full, targetSlug: string) => {
      return `](${toLocal(targetSlug)})`
    })
    .replaceAll(/href="\/docs\/([a-z0-9\-_/]+)"/g, (_full, targetSlug: string) => {
      return `href="${toLocal(targetSlug)}"`
    })
}

function resolveLocalDoc({
  targetSlug,
  outputSlugs,
}: {
  targetSlug: string
  outputSlugs: Set<string>
}) {
  const candidates = [`${targetSlug}.md`, `${targetSlug}/index.md`]
  return candidates.find(candidate => outputSlugs.has(candidate))
}

function stripJsx(markdown: string) {
  return markdown
    .replace(/<Cards[\s\S]*?<\/Cards>/g, '')
    .replace(/<Card[\s\S]*?<\/Card>/g, '')
    .replace(/<\/?[A-Z][A-Za-z0-9]*\b[^>]*>/g, '')
    .replace(/<div\b[^>]*>/g, '')
    .replace(/<\/div>/g, '')
    .replace(/<p\b[^>]*>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g, '### $1\n')
    .replace(/<span\b[^>]*>([\s\S]*?)<\/span>/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
}
