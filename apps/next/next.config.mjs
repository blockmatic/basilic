import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/core', '@repo/react', '@repo/error', '@repo/utils'],
  // Suppress OpenTelemetry/Sentry warnings about external packages
  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],
}

// Only wrap with Sentry if DSN is configured
// eslint-disable-next-line no-undef
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      silent: true,
      // eslint-disable-next-line no-undef
      org: process.env.SENTRY_ORG,
      // eslint-disable-next-line no-undef
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig
