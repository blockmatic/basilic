import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import swagger from '@fastify/swagger'
import Fastify from 'fastify'
import app from '../src/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generateOpenAPI() {
  // Create Fastify instance (same as production)
  const fastify = Fastify({
    logger: false, // Disable logging for generation
  })

  try {
    // Register @fastify/swagger FIRST (before routes)
    // Swagger needs to scan routes as they're registered
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Basilic API',
          version: '1.0.0',
          description: 'Basilic API documentation',
        },
      },
    })

    // Register app (which autoloads plugins + routes)
    // Swagger will automatically scan route schemas as they're registered
    await fastify.register(app)

    // Wait for Fastify to be ready before generating OpenAPI
    await fastify.ready()

    // Generate OpenAPI JSON
    const openApiDocument = fastify.swagger()

    // Write to openapi.json
    const outputPath = join(__dirname, '../openapi/openapi.json')
    await writeFile(outputPath, JSON.stringify(openApiDocument, null, 2), 'utf-8')

    console.log(`✅ OpenAPI spec generated: ${outputPath}`)
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI spec:', error)
    process.exit(1)
  } finally {
    await fastify.close()
  }
}

generateOpenAPI()
