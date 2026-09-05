#!/usr/bin/env node

import { rmSync } from 'node:fs'
import { bundledTemplateRoot, repoRootFromPackage } from '../paths.js'
import { assembleTemplate } from './index.js'

const lockfile = process.env.CREATE_BASILIC_LOCKFILE === '1'
const allowDirty = process.env.CREATE_BASILIC_ALLOW_DIRTY === '1'
const dest = process.env.CREATE_BASILIC_TEMPLATE_DIR ?? bundledTemplateRoot

rmSync(dest, { recursive: true, force: true })
const result = assembleTemplate({
  repoRoot: repoRootFromPackage,
  dest,
  lockfile,
  allowDirty,
})
process.stderr.write(
  `Assembled template at ${dest}\nSHA ${result.sourceSha}\ndigest ${result.digest}\n`,
)
