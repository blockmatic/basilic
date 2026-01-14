import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../../apps/api/openapi/openapi.json',
  output: {
    path: './src/gen',
    format: 'prettier',
  },
  types: {
    enums: 'typescript',
  },
})
