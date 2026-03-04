'use client'

import { useEffect, useRef } from 'react'

export function useVerifyLinkEmailToken(
  token: string | null,
  isReady: boolean,
  verifyFromToken: (params: { token: string }) => Promise<unknown>,
) {
  const verified = useRef<string | null>(null)

  useEffect(() => {
    if (!token || !isReady || verified.current === token) return
    verified.current = token
    verifyFromToken({ token }).catch(() => {
      verified.current = null
    })
  }, [token, isReady, verifyFromToken])
}
