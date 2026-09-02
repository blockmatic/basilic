'use client'

import { useEffect, useState } from 'react'

export function useWebAuthnAvailable(): boolean {
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
