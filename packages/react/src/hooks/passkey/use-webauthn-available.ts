'use client'

import { useEffect, useState } from 'react'

export function useWebAuthnAvailable() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    setAvailable(
      typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential !== 'undefined' &&
        window.isSecureContext,
    )
  }, [])

  return available
}
