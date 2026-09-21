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
  // Package-name external does not match @repo/utils/logger/* subpaths.
  external: ['@sentry/node', '@sentry/nextjs', '@sentry/browser', 'react', 'pino', /^@repo\/utils/],
})
