import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload'
import type { FastifyPluginAsync } from 'fastify'

const appFile = fileURLToPath(import.meta.url)
const appDir = path.dirname(appFile)

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application

  void fastify.register(AutoLoad, {
    dir: path.join(appDir, 'plugins'),
    options: opts,
    forceESM: true,
    ignorePattern: /\.(spec|test)\.ts$/,
  })

  // This loads all plugins defined in routes
  // define your routes in one of these

  void fastify.register(AutoLoad, {
    dir: path.join(appDir, 'routes'),
    options: opts,
    forceESM: true,
    ignorePattern: /\.(spec|test)\.ts$/,
  })
}

export default app
export { app, options }
