#!/usr/bin/env node

import { createInterface } from 'node:readline'
import { createClient } from '@repo/core'
import { Command } from 'commander'
import { loadConfig, resolveApiKey, resolveBaseUrl, saveConfig } from './config.js'
import { commandSpecs, operationMeta } from './gen/commands.gen.js'
import { runCommand } from './run-command.js'

async function promptApiKey(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question('API key: ', answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function ensureApiKey(): Promise<string> {
  const fromEnv = resolveApiKey()
  if (fromEnv) return fromEnv
  const fromConfig = loadConfig().apiKey
  if (fromConfig) return fromConfig

  if (!process.stdin.isTTY) {
    console.error(
      'API key required. Set API_KEY or BASILIC_API_KEY env var, or run: basilic config set-api-key',
    )
    process.exit(1)
  }

  const key = await promptApiKey()
  if (!key) {
    console.error('API key is required')
    process.exit(1)
  }
  saveConfig({ apiKey: key })
  return key
}

function buildOpts(
  meta: (typeof operationMeta)[keyof typeof operationMeta],
  cmdOpts: Record<string, unknown>,
): Record<string, string | undefined> {
  const opts: Record<string, string | undefined> = {}
  const rawBody = cmdOpts.body as string | undefined
  if (rawBody)
    try {
      const parsed = JSON.parse(rawBody) as Record<string, unknown>
      for (const [k, v] of Object.entries(parsed)) if (v !== undefined) opts[k] = String(v)
      return opts
    } catch {
      console.error('Invalid --body JSON')
      process.exit(1)
    }

  for (const p of meta.pathParams) opts[p.name] = String(cmdOpts[p.name] ?? '')
  for (const p of meta.bodyParams) opts[p.name] = String(cmdOpts[p.name] ?? '')
  return opts
}

function toKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

const program = new Command()

program
  .name('basilic')
  .description('CLI for Basilic API (API key auth only; excludes auth endpoints)')
  .version('0.0.0')
  .option('-b, --base-url <url>', 'API base URL', resolveBaseUrl())

const configCmd = program.command('config').description('Config management')
configCmd
  .command('set-api-key [key]')
  .description('Set API key (prompts if omitted)')
  .action(async (key?: string) => {
    let value = key
    if (!value) {
      if (!process.stdin.isTTY) {
        console.error('Provide key as argument or set API_KEY env var')
        process.exit(1)
      }
      value = await promptApiKey()
    }
    if (!value) {
      console.error('API key is required')
      process.exit(1)
    }
    saveConfig({ apiKey: value })
    console.log('API key saved to config')
  })

configCmd
  .command('set-base-url <url>')
  .description('Set default base URL')
  .action((url: string) => {
    saveConfig({ baseUrl: url })
    console.log('Base URL saved to config')
  })

const commandCache = new Map<string, Command>()

function getOrCreateCommand(parent: Command, pathSegment: string): Command {
  const fullPath = parent === program ? pathSegment : `${parent.name()} ${pathSegment}`
  const cached = commandCache.get(fullPath)
  if (cached) return cached

  const cmd = parent.command(pathSegment)
  commandCache.set(fullPath, cmd)
  return cmd
}

type CommandSpec = (typeof commandSpecs)[number]
type OperationMeta = (typeof operationMeta)[keyof typeof operationMeta]

function registerApiCommand(cmd: Command, spec: CommandSpec, meta: OperationMeta) {
  const seg = spec.path[spec.path.length - 1]!
  cmd.summary(meta.summary).description(meta.description)
  for (const p of meta.pathParams)
    if (seg === toKebab(p.name)) cmd.argument(`<${p.name}>`, `${p.name} (path param)`)
    else cmd.option(`--${p.name} <value>`, `${p.name} (path param)`)

  for (const p of meta.bodyParams) cmd.option(`--${p.name} <value>`, `body.${p.name}`)
  cmd.option('--body <json>', 'raw JSON body (overrides individual body opts)')
  cmd.action(async function (this: Command, ...positionalArgs: unknown[]) {
    const baseUrl = (this.parent?.opts().baseUrl as string) ?? resolveBaseUrl()
    const optsFromCmd = (this.opts?.() ?? {}) as Record<string, unknown>
    const pathParamValues: Record<string, string> = {}
    meta.pathParams.forEach((p, i) => {
      const val = positionalArgs[i]
      if (val !== undefined) pathParamValues[p.name] = String(val)
    })
    const cmdOpts = { ...optsFromCmd, ...pathParamValues }
    const apiKey = await ensureApiKey()
    const client = createClient({ baseUrl, apiKey })
    const opts = buildOpts(meta, cmdOpts)
    try {
      const result = await runCommand({ client, spec, meta, opts })
      console.log(JSON.stringify(result, null, 2))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const body =
        err && typeof err === 'object' && 'body' in err
          ? (err as { body: unknown }).body
          : undefined
      console.error('Error:', msg)
      if (body) console.error('Details:', JSON.stringify(body, null, 2))
      process.exit(1)
    }
  })
}

for (const spec of commandSpecs) {
  const meta = operationMeta[spec.operationId as keyof typeof operationMeta]
  let parent: Command = program
  for (let i = 0; i < spec.path.length; i++) {
    const seg = spec.path[i]!
    const cmd = getOrCreateCommand(parent, seg)
    if (i === spec.path.length - 1) registerApiCommand(cmd, spec, meta)
    parent = cmd
  }
}

program.parse()
