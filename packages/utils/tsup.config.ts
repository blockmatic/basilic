import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/async/index.ts',
    'src/web3/index.ts',
    'src/logger/index.ts',
    'src/logger/client.ts',
    'src/logger/server.ts',
    'src/debug/index.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
