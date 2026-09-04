import { render as reactEmailRender } from '@react-email/render'
import React, { type ReactNode } from 'react'

const ensureReactGlobal = () => {
  if (typeof globalThis === 'undefined') return

  const globalScope = globalThis as typeof globalThis & { React?: typeof React }
  if (!globalScope.React) globalScope.React = React
}

// Ensure React is available globally at module load time
// This provides a defensive measure in case components are evaluated before render() is called
ensureReactGlobal()

/**
 * Renders an email template component to an HTML string.
 *
 * Server-only function that converts React Email components to HTML strings.
 * Uses `@react-email/render` which supports async rendering and Suspense.
 *
 * **Important**: This function must only be used in server-side code:
 * - API routes (Next.js, Fastify, etc.)
 * - Server Components (Next.js)
 * - Server Actions (Next.js)
 * - Node.js scripts
 *
 * Do not use in client components or browser code.
 *
 * @param component - React Email component to render
 * @returns Promise resolving to HTML string
 *
 * @example
 * ```ts
 * // In API route or Server Component
 * import { WelcomeEmail } from '@repo/email/emails/welcome'
 * import { render } from '@repo/email/render'
 *
 * const html = await render(<WelcomeEmail fullName="John Doe" />)
 * // Send HTML via email service...
 * ```
 *
 * @example
 * ```ts
 * // In Fastify route
 * import { render } from '@repo/email/render'
 * import { LoginNotificationEmail } from '@repo/email/emails/login-notification'
 *
 * fastify.post('/send-notification', async (request, reply) => {
 *   const html = await render(
 *     <LoginNotificationEmail
 *       ipAddress="192.168.1.1"
 *       location="San Francisco"
 *       device="Chrome"
 *     />
 *   )
 *   await emailService.send({ html, to: user.email })
 * })
 * ```
 */
export const render = async (
  component: ReactNode,
  options?: { plainText?: boolean },
): Promise<string> => {
  ensureReactGlobal()
  return reactEmailRender(component, options?.plainText ? { plainText: true } : undefined)
}
