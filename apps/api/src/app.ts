import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload'
import type { FastifyPluginAsync } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true,
  })

  // This loads all plugins defined in routes
  // define your routes in one of these

  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: opts,
    forceESM: true,
  })
}

export default app
export { app, options }
