import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtemp, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assertEmptyDest, copyTree, IoError } from './copy.js'

describe('copyTree', () => {
  it('refuses symlinks', async () => {
    const root = await mkdtemp(join(tmpdir(), 'create-basilic-copy-'))
    writeFileSync(join(root, 'file.txt'), 'ok')
    await symlink(join(root, 'file.txt'), join(root, 'link.txt'))
    await expect(copyTree({ from: root, to: join(root, 'out') })).rejects.toThrow(IoError)
  })

  it('copies paths with spaces', async () => {
    const root = await mkdtemp(join(tmpdir(), 'create-basilic-copy-'))
    const from = join(root, 'from dir')
    mkdirSync(from)
    writeFileSync(join(from, 'hello.txt'), 'hi')
    const to = join(root, 'to dir')
    await copyTree({ from, to })
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(join(to, 'hello.txt'), 'utf8')).toBe('hi')
  })
})

describe('assertEmptyDest', () => {
  it('rejects a non-empty directory', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'create-basilic-dest-'))
    writeFileSync(join(dest, 'keep.txt'), 'nope')
    await expect(assertEmptyDest({ dest })).rejects.toThrow(/not empty/)
  })

  it('rejects an existing file', async () => {
    const dest = join(await mkdtemp(join(tmpdir(), 'create-basilic-file-')), 'out.txt')
    writeFileSync(dest, 'nope')
    await expect(assertEmptyDest({ dest })).rejects.toThrow(/not an empty directory/)
  })
})
