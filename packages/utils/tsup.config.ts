import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/async/index.ts',
    'src/web3/index.ts',
    'src/logger/client.ts',
    'src/logger/server.ts',
    'src/logger/types.ts',
    'src/debug/index.ts',
    'src/data/index.ts',
  ],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
