import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.json', // Path to OpenAPI spec
  output: {
    path: './src/gen', // Output directory
    format: 'prettier', // Format code with Prettier
  },
  types: {
    enums: 'typescript', // Generate TypeScript enums
  },
  schemas: {
    type: 'zod', // Generate Zod schemas for validation
  },
})
