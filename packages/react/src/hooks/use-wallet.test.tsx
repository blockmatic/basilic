import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WalletProvider } from '../wallet/context'
import type { WalletAdapter } from '../wallet/types'
import { useWallet } from './use-wallet'

const mockEvmAdapter: WalletAdapter = {
  chain: 'eip155',
  address: '0x1234567890123456789012345678901234567890',
  signMessage: vi.fn().mockResolvedValue({ signature: '0xsig' }),
}

const mockSolanaAdapter: WalletAdapter = {
  chain: 'solana',
  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  signMessage: vi.fn().mockResolvedValue({ signature: 'base64sig' }),
}

function createWrapper(adapters: { eip155?: WalletAdapter; solana?: WalletAdapter }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <WalletProvider adapters={adapters}>{children}</WalletProvider>
  }
}

describe('useWallet', () => {
  it('returns undefined when no WalletProvider', () => {
    const { result } = renderHook(() => useWallet())
    expect(result.current).toBeUndefined()
  })

  it('returns adapter for chain when provided', () => {
    const { result } = renderHook(() => useWallet('eip155'), {
      wrapper: createWrapper({ eip155: mockEvmAdapter }),
    })
    expect(result.current).toBe(mockEvmAdapter)
    expect(result.current?.chain).toBe('eip155')
  })

  it('returns solana adapter when chain is solana', () => {
    const { result } = renderHook(() => useWallet('solana'), {
      wrapper: createWrapper({ solana: mockSolanaAdapter }),
    })
    expect(result.current).toBe(mockSolanaAdapter)
    expect(result.current?.chain).toBe('solana')
  })

  it('returns first available adapter when chain not specified', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper({ eip155: mockEvmAdapter, solana: mockSolanaAdapter }),
    })
    expect(result.current?.chain).toBe('eip155')
  })
})
