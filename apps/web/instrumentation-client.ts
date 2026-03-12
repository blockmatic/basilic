import * as Sentry from '@sentry/nextjs'

import './error-reporting.client.js'

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
