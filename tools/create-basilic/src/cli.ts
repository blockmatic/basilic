#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { Command } from 'commander'
import { IoError } from './copy.js'
import { exitCodes } from './exit-codes.js'
import { generateProject } from './generate.js'
import { ValidationError } from './project-name.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string
}

const program = new Command()

program
  .name('create-basilic')
  .description('Scaffold an independent Basilic API, web, and mobile monorepo')
  .version(pkg.version)
  .argument('<directory>', 'Destination directory (created; must be empty)')
  .option('-y, --yes', 'Accept safe defaults (never overwrites)')
  .action(async (directory: string, options: { yes?: boolean }) => {
    try {
      const result = await generateProject({
        directory,
        yes: Boolean(options.yes),
        generatorVersion: pkg.version,
      })
      process.stdout.write(`Created ${result.name.displayName} at ${result.dest}\n\n`)
      process.stdout.write('Next:\n')
      process.stdout.write(`  cd ${directory}\n`)
      process.stdout.write('  pnpm setup\n')
      process.stdout.write('  pnpm --filter @repo/api db:start\n')
      process.stdout.write('  pnpm reset\n')
      process.stdout.write('  pnpm dev\n\n')
      process.stdout.write(
        'Product Ready: https://basilic-docs.vercel.app/docs/testing/product-ready\n',
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      process.stderr.write(`${message}\n`)
      if (error instanceof ValidationError) process.exit(error.exitCode)
      if (error instanceof IoError) process.exit(error.exitCode)
      process.exit(exitCodes.io)
    }
  })

program.parseAsync(process.argv).catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`)
  process.exit(exitCodes.io)
})

process.on('SIGINT', () => {
  process.stderr.write('\nInterrupted\n')
  process.exit(exitCodes.interrupt)
})
