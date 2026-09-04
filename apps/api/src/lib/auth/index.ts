export { recordAuthFailedAttempt } from './attempts.js'
export { hasRemainingLoginMethod, withUserSignInMethodLock } from './guardrails.js'
export {
  authLoginRouteConfig,
  authRouteRateLimit,
  productionLoginRateLimitMax,
} from './route-rate-limit.js'
export { logAuthLocked, logAuthVerifyFailed } from './signals.js'
