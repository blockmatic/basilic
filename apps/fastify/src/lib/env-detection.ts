/**
 * Environment detection utilities
 * Determines the current runtime environment for appropriate database and migration handling
 */

export function isVercel(): boolean {
  return process.env.VERCEL === '1'
}

export function isVercelProduction(): boolean {
  return isVercel() && process.env.VERCEL_GIT_COMMIT_REF === 'main'
}

export function isVercelPreview(): boolean {
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF
  // Only return true if running on Vercel AND commit ref is defined and not 'main'
  return isVercel() && typeof commitRef === 'string' && commitRef.trim() !== 'main'
}

export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && !isVercel()
}

export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test'
}
