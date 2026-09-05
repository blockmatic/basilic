import { copyFile, lstat, mkdir, readdir, rename, rm } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { exitCodes } from './exit-codes.js'

export class IoError extends Error {
  exitCode = exitCodes.io
}

export async function isEmptyDir({ path }: { path: string }) {
  try {
    const entries = await readdir(path)
    return entries.length === 0
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true
    throw error
  }
}

export async function assertEmptyDest({ dest }: { dest: string }) {
  try {
    const stat = await lstat(dest)
    if (stat.isFile() || stat.isSymbolicLink())
      throw new IoError(`Destination "${dest}" exists and is not an empty directory.`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const empty = await isEmptyDir({ path: dest })
  if (!empty)
    throw new IoError(
      `Destination "${dest}" already exists and is not empty. Refusing to overwrite.`,
    )
}

export async function copyTree({
  from,
  to,
  root = from,
}: {
  from: string
  to: string
  root?: string
}) {
  const resolvedFrom = resolve(from)
  const resolvedTo = resolve(to)
  const rel = relative(root, resolvedFrom)
  if (rel.startsWith(`..${sep}`) || rel === '..')
    throw new IoError(`Path escaped template root: ${resolvedFrom}`)

  const stat = await lstat(resolvedFrom)
  if (stat.isSymbolicLink()) throw new IoError(`Refusing to copy symlink "${rel || resolvedFrom}"`)

  if (stat.isDirectory()) {
    await mkdir(resolvedTo, { recursive: true })
    const entries = await readdir(resolvedFrom)
    for (const name of entries)
      await copyTree({ from: join(resolvedFrom, name), to: join(resolvedTo, name), root })
    return
  }

  if (!stat.isFile()) throw new IoError(`Refusing to copy special file "${rel}"`)

  await mkdir(dirname(resolvedTo), { recursive: true })
  await copyFile(resolvedFrom, resolvedTo)
}

export async function moveAtomic({ from, to }: { from: string; to: string }) {
  await mkdir(dirname(to), { recursive: true })
  try {
    await rename(from, to)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'EXDEV' && code !== 'EPERM') throw error
    await copyTree({ from, to })
    await rm(from, { recursive: true, force: true })
  }
}
