import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../../apps/api/openapi/openapi.json',
  output: {
    path: './src/gen',
  },
  types: {
    enums: 'typescript',
  },
})
