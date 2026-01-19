import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../../apps/fastify/openapi/openapi.json',
  output: {
    path: './src/gen',
    postProcess: ['prettier'],
  },
  // Note: TanStack Query hooks are created manually in src/hooks/
})
