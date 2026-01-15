import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/async/index.ts', 'src/error/index.ts', 'src/web3/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
