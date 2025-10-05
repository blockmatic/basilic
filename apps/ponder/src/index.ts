import { type Context, type Event, ponder } from 'ponder:registry'
import { Asset, SwapEvent } from 'ponder:schema'
import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { erc20Abi, formatUnits } from 'viem'

// Main Event Handler
ponder.on(
  'UniswapV3Pool:Swap',
  async ({
    event,
    context,
  }: {
    event: Event<'UniswapV3Pool:Swap'>
    context: Context<'UniswapV3Pool:Swap'>
  }) => {
    const poolAddress = event.log.address
    const { amount0, amount1, sqrtPriceX96 } = event.args
    const chainId = context.network.chainId.toString()

    // Get token addresses
    const [token0, token1] = await getPoolTokens(context, poolAddress)

    // Cache token information in database if not already present
    // This ensures we only query the chain for token info once
    await Promise.all([
      getTokenInfo(context, token0, chainId),
      getTokenInfo(context, token1, chainId),
    ])

    // Get token details from our database
    const [token0Data, token1Data] = await Promise.all([
      context.db.find(Asset, { id: `${token0}-${chainId}` }),
      context.db.find(Asset, { id: `${token1}-${chainId}` }),
    ])

    // Format amounts using proper decimals from our cached data
    const amount0Formatted = formatUnits(amount0, token0Data?.decimals ?? 18)
    const amount1Formatted = formatUnits(amount1, token1Data?.decimals ?? 18)

    // Calculate price from sqrtPriceX96
    const price = calculateUniswapV3Price(sqrtPriceX96)

    // Create unique ID for the swap event
    const id = `${event.transaction.hash}-${event.log.logIndex}`

    // Store the swap event
    await context.db.insert(SwapEvent).values({
      id,
      poolAddress,
      token0Address: token0,
      token1Address: token1,
      amount0,
      amount1,
      sqrtPriceX96,
      price,
      volume: new BigNumber(amount0Formatted).plus(amount1Formatted).toString(),
      timestamp: Number(event.block.timestamp),
      blockNumber: Number(event.block.number),
    })

    // Log the swap details
    console.log(`[Swap] Pool: ${poolAddress}`)
    console.log(`Token0: ${token0} (${token0Data?.symbol ?? 'UNKNOWN'})`)
    console.log(`Token1: ${token1} (${token1Data?.symbol ?? 'UNKNOWN'})`)
    console.log(`Amount0: ${amount0Formatted} | Amount1: ${amount1Formatted}`)
    console.log(`Price: ${price}`)
    console.log(
      `Block: ${event.block.number} | Timestamp: ${event.block.timestamp}`,
    )
  },
)

// Helper Functions
async function getTokenInfo(
  context: Context<'UniswapV3Pool:Swap'>,
  tokenAddress: Address,
  chainId: string,
): Promise<void> {
  const id = `${tokenAddress}-${chainId}`

  try {
    // Try to find the asset in our database first to avoid unnecessary chain calls
    const existingAsset = await context.db.find(Asset, { id })
    if (existingAsset) return

    // If asset not found in database, fetch from chain
    const [name, symbol, decimals] = await Promise.all([
      context.client.readContract({
        abi: erc20Abi,
        functionName: 'name',
        address: tokenAddress,
      }),
      context.client.readContract({
        abi: erc20Abi,
        functionName: 'symbol',
        address: tokenAddress,
      }),
      context.client.readContract({
        abi: erc20Abi,
        functionName: 'decimals',
        address: tokenAddress,
      }),
    ])

    // Cache the token information in our database
    await context.db.insert(Asset).values({
      id,
      name,
      symbol,
      decimals,
      chainId,
      address: tokenAddress,
      isStable: false,
      isNFT: false,
    })
  } catch (error) {
    console.error(
      `Failed to fetch/store token info for ${tokenAddress}:`,
      error,
    )
  }
}

// Utility Functions
async function getPoolTokens(
  context: Context<'UniswapV3Pool:Swap'>,
  poolAddress: Address,
): Promise<[Address, Address]> {
  return Promise.all([
    context.client.readContract({
      abi: context.contracts.UniswapV3Pool.abi,
      functionName: 'token0',
      address: poolAddress,
    }),
    context.client.readContract({
      abi: context.contracts.UniswapV3Pool.abi,
      functionName: 'token1',
      address: poolAddress,
    }),
  ])
}

function calculateUniswapV3Price(sqrtPriceX96: bigint): string {
  return new BigNumber(sqrtPriceX96.toString())
    .multipliedBy(sqrtPriceX96.toString())
    .dividedBy(new BigNumber(2).pow(192))
    .toString()
}
