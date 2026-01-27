// This file contains code that we reuse between our tests.

import * as path from 'node:path'
import type * as test from 'node:test'
import { fileURLToPath } from 'node:url'
import helper from 'fastify-cli/helper.js'

export type TestContext = {
  after: typeof test.after
}

const helperFile = fileURLToPath(import.meta.url)
const helperDir = path.dirname(helperFile)
const AppPath = path.join(helperDir, '..', 'src', 'app.ts')

// Fill in this config with all the configurations
// needed for testing the application
function config() {
  return {
    skipOverride: true, // Register our application with fastify-plugin
  }
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, config())

  // Tear down our app after we are done

  t.after(() => void app.close())

  return app
}

export { config, build }
