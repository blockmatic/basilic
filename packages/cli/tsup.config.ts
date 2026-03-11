import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  noExternal: ['@repo/core'],
})
