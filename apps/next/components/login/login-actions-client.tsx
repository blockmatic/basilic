'use client'

import dynamic from 'next/dynamic'

export const LoginActionsClient = dynamic(
  () => import('./login-actions').then(m => ({ default: m.LoginActions })),
  { ssr: false },
)
