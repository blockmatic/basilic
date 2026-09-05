import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = dirname(fileURLToPath(import.meta.url))

export const packageRoot = join(srcDir, '..')

export const repoRootFromPackage = join(packageRoot, '../..')

export const manifestPath = join(packageRoot, 'manifest.json')

export const bundledTemplateRoot = join(packageRoot, 'template')
