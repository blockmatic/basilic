import isNumber from 'lodash-es/isNumber'
import isString from 'lodash-es/isString'
import type { Chain } from 'viem'
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from 'viem/chains'
import type { ChainType } from './chain-type.js'

export interface ChainMetadata {
  chainType: ChainType
  chainId: number | string
  name: string
  viemChain?: Chain
  defaultRpcUrl?: string
}

const evmChains: Record<number, ChainMetadata> = {
  1: {
    chainType: 'evm',
    chainId: 1,
    name: 'Ethereum Mainnet',
    viemChain: mainnet,
    defaultRpcUrl: 'https://cloudflare-eth.com',
  },
  11155111: {
    chainType: 'evm',
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    viemChain: sepolia,
  },
  42161: {
    chainType: 'evm',
    chainId: 42161,
    name: 'Arbitrum One',
    viemChain: arbitrum,
  },
  421614: {
    chainType: 'evm',
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    viemChain: arbitrumSepolia,
  },
  8453: {
    chainType: 'evm',
    chainId: 8453,
    name: 'Base Mainnet',
    viemChain: base,
  },
  84532: {
    chainType: 'evm',
    chainId: 84532,
    name: 'Base Sepolia',
    viemChain: baseSepolia,
  },
  10: {
    chainType: 'evm',
    chainId: 10,
    name: 'Optimism',
    viemChain: optimism,
  },
  11155420: {
    chainType: 'evm',
    chainId: 11155420,
    name: 'Optimism Sepolia',
    viemChain: optimismSepolia,
  },
  137: {
    chainType: 'evm',
    chainId: 137,
    name: 'Polygon',
    viemChain: polygon,
  },
  80002: {
    chainType: 'evm',
    chainId: 80002,
    name: 'Polygon Amoy',
    viemChain: polygonAmoy,
  },
}

const solanaClusters: Record<string, ChainMetadata> = {
  'mainnet-beta': {
    chainType: 'solana',
    chainId: 'mainnet-beta',
    name: 'Solana Mainnet',
    defaultRpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  devnet: {
    chainType: 'solana',
    chainId: 'devnet',
    name: 'Solana Devnet',
    defaultRpcUrl: 'https://api.devnet.solana.com',
  },
  testnet: {
    chainType: 'solana',
    chainId: 'testnet',
    name: 'Solana Testnet',
    defaultRpcUrl: 'https://api.testnet.solana.com',
  },
}

const chainRegistry = new Map<string, ChainMetadata>()

Object.values(evmChains).forEach(chain => {
  chainRegistry.set(String(chain.chainId), chain)
})

Object.values(solanaClusters).forEach(chain => {
  chainRegistry.set(String(chain.chainId), chain)
})

export function getChainMetadata(chainId: number | string): ChainMetadata | undefined {
  if (isString(chainId)) {
    const byChainId = chainRegistry.get(chainId)
    if (byChainId) return byChainId

    const bySolanaCluster = solanaClusters[chainId]
    if (bySolanaCluster) return bySolanaCluster
  }

  if (isNumber(chainId)) return evmChains[chainId]

  if (isString(chainId) && /^\d+$/.test(chainId)) {
    const numericId = Number(chainId)
    return evmChains[numericId]
  }

  return undefined
}
