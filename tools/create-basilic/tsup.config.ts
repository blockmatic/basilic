import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node24',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  noExternal: ['commander'],
  banner: {
    js: '#!/usr/bin/env node',
  },
})
