import { UniswapV3PoolAbi } from '@repo/core/abis'
import { createConfig } from 'ponder'
import { createPublicClient, http } from 'viem'
import { indexerConfig } from './src/config'

// Create a public client to interact with Arbitrum
const publicClient = createPublicClient({
  transport: http(indexerConfig.networks.arbitrum.rpcUrl),
})

// Get the latest block number
// This is for demo purposes, in production, the start block should be set manually
const startBlock = Number(await publicClient.getBlockNumber())

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: indexerConfig.database.url,
  },
  networks: {
    arbitrum: {
      chainId: indexerConfig.networks.arbitrum.chainId,
      transport: http(indexerConfig.networks.arbitrum.rpcUrl),
    },
  },
  contracts: {
    UniswapV3Pool: {
      network: 'arbitrum',
      abi: UniswapV3PoolAbi,
      address: '0xc6962004f452be9203591991d15f6b388e09e8d0', // USDC/WETH pool
      startBlock, // Use the fetched block number
      filter: {
        event: 'Swap',
        args: {
          sender: null,
          recipient: null,
        },
      },
    },
  },
})
