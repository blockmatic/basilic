import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    core: 'src/core/index.ts',
    node: 'src/node/index.ts',
    nextjs: 'src/nextjs/index.ts',
    browser: 'src/browser/index.ts',
    react: 'src/react/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: [
    '@repo/utils',
    '@repo/utils/logger',
    '@sentry/node',
    '@sentry/nextjs',
    '@sentry/browser',
    'react',
  ],
})
