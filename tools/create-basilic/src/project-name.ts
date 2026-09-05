import { basename } from 'node:path'
import { exitCodes } from './exit-codes.js'

export type ProjectName = {
  slug: string
  displayName: string
  packageName: string
}

export class ValidationError extends Error {
  exitCode = exitCodes.validation
}

export function parseProjectName({ directory }: { directory: string }): ProjectName {
  const base = basename(directory).trim()
  if (!base) throw new ValidationError('Destination directory name is empty')

  const slug = base
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9.-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) throw new ValidationError(`Cannot derive an npm-safe name from "${base}"`)
  if (slug.length > 214) throw new ValidationError('Project name exceeds 214 characters')
  if (!/^[a-z0-9]/.test(slug))
    throw new ValidationError('Project name must start with a letter or number')
  if (/--/.test(slug) || slug.endsWith('.') || slug.startsWith('.'))
    throw new ValidationError(`Invalid npm package name "${slug}"`)

  const displayName = slug
    .split(/[-.]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return { slug, displayName, packageName: slug }
}

export function assertNode24() {
  const major = Number(process.versions.node.split('.')[0])
  if (major !== 24)
    throw new ValidationError(`create-basilic requires Node.js 24.x (found ${process.version})`)
}
