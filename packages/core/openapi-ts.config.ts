import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../../apps/fastify/openapi/openapi.json',
  output: {
    path: './src/gen',
    format: 'prettier',
  },
  types: {
    enums: 'typescript',
  },
  schemas: {
    type: 'zod',
  },
})
