import { render as reactEmailRender } from '@react-email/render'
import type { ReactNode } from 'react'

/**
 * Render an email template component to HTML string.
 * Uses @react-email/render which supports async rendering and Suspense.
 */
export const render = async (component: ReactNode): Promise<string> => {
  return reactEmailRender(component)
}
