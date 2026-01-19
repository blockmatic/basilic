import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import swagger from '@fastify/swagger'
import Fastify from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Post-process OpenAPI schema to remove fields with default values from required arrays.
 * This fixes the issue where z.toJSONSchema() marks optional-with-default fields as required.
 */
function removeDefaultsFromRequired(schema: unknown): unknown {
  if (!schema || typeof schema !== 'object') {
    return schema
  }

  const obj = schema as Record<string, unknown>

  // If this is a schema object with properties and required
  if ('properties' in obj && 'required' in obj && Array.isArray(obj.required)) {
    const properties = obj.properties as Record<string, unknown> | undefined
    const required = obj.required as string[]

    if (properties) {
      // Remove any property from required if it has a default value
      const newRequired = required.filter(key => {
        const prop = properties[key]
        if (prop && typeof prop === 'object' && 'default' in prop) {
          return false
        }
        return true
      })

      // Recursively process properties
      const newProperties: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(properties)) {
        newProperties[key] = removeDefaultsFromRequired(value)
      }

      return {
        ...obj,
        properties: newProperties,
        required: newRequired.length > 0 ? newRequired : undefined,
      }
    }
  }

  // Recursively process nested objects
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'paths' && typeof value === 'object' && value !== null) {
      // Process paths object
      const paths = value as Record<string, unknown>
      const newPaths: Record<string, unknown> = {}
      for (const [pathKey, pathValue] of Object.entries(paths)) {
        newPaths[pathKey] = removeDefaultsFromRequired(pathValue)
      }
      result[key] = newPaths
    } else if (key === 'components' && typeof value === 'object' && value !== null) {
      // Process components object
      const components = value as Record<string, unknown>
      const newComponents: Record<string, unknown> = {}
      for (const [compKey, compValue] of Object.entries(components)) {
        if (compKey === 'schemas' && typeof compValue === 'object' && compValue !== null) {
          const schemas = compValue as Record<string, unknown>
          const newSchemas: Record<string, unknown> = {}
          for (const [schemaKey, schemaValue] of Object.entries(schemas)) {
            newSchemas[schemaKey] = removeDefaultsFromRequired(schemaValue)
          }
          newComponents[compKey] = newSchemas
        } else {
          newComponents[compKey] = removeDefaultsFromRequired(compValue)
        }
      }
      result[key] = newComponents
    } else if (
      (key === 'requestBody' || key === 'responses' || key === 'body' || key === 'schema') &&
      typeof value === 'object' &&
      value !== null
    ) {
      // Process requestBody, responses, body, schema
      result[key] = removeDefaultsFromRequired(value)
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => removeDefaultsFromRequired(item))
    } else if (typeof value === 'object' && value !== null) {
      result[key] = removeDefaultsFromRequired(value)
    } else {
      result[key] = value
    }
  }

  return result
}

async function generateOpenAPI() {
  // Set dummy key for OpenAPI generation if not provided
  // This avoids requiring a real key just to generate the spec
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'sk-test-dummy-key-for-openapi'
  }

  const { default: app } = await import('../src/app.js')

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

    // Post-process to remove default-valued fields from required arrays
    const processedDocument = removeDefaultsFromRequired(openApiDocument) as typeof openApiDocument

    // Write to openapi.json
    const outputPath = join(__dirname, '../openapi/openapi.json')
    await writeFile(outputPath, JSON.stringify(processedDocument, null, 2), 'utf-8')

    console.log(`✅ OpenAPI spec generated: ${outputPath}`)
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI spec:', error)
    process.exit(1)
  } finally {
    await fastify.close()
  }
}

generateOpenAPI()
