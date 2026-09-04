import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/utils/index.ts',
    core: 'src/core/index.ts',
    node: 'src/node/index.ts',
    nextjs: 'src/nextjs/index.ts',
    'nextjs-server': 'src/nextjs/server.ts',
    browser: 'src/browser/index.ts',
    react: 'src/react/index.ts',
  },
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  noExternal: ['@repo/utils'],
  // Utils are internal; logger from @repo/utils
  external: ['@sentry/node', '@sentry/nextjs', '@sentry/browser', 'react', 'pino'],
})
