import type { Program } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
import { createMint, getMint } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import type { TestToken } from '../target/types/test_token'

async function main() {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.TestToken as Program<TestToken>

  // Get cluster from environment or default to localnet
  const cluster = process.env.CLUSTER || 'localnet'
  console.log(`Deploying to ${cluster}`)

  // Find mint authority PDA
  const [mintAuthority] = PublicKey.findProgramAddressSync([Buffer.from('mint')], program.programId)

  console.log('Program ID:', program.programId.toString())
  console.log('Mint Authority PDA:', mintAuthority.toString())

  // Create a mint for testing
  const payer = provider.wallet as anchor.Wallet
  const decimalsRaw = process.env.DECIMALS || '9'
  const decimalsParsed = parseInt(decimalsRaw, 10)

  if (!Number.isInteger(decimalsParsed) || decimalsParsed < 0 || decimalsParsed > 9) {
    throw new Error(
      `Invalid DECIMALS value: ${decimalsRaw}. Must be an integer between 0 and 9 (SPL Token allowed range).`,
    )
  }

  const decimals = decimalsParsed

  console.log(`Creating mint with ${decimals} decimals...`)

  const mint = await createMint(
    provider.connection,
    payer.payer, // payer
    mintAuthority, // mint authority
    mintAuthority, // freeze authority
    decimals,
  )

  console.log('Mint created:', mint.toString())

  const mintInfo = await getMint(provider.connection, mint)
  console.log('Mint decimals:', mintInfo.decimals)
  console.log('Mint supply:', mintInfo.supply.toString())
}

main()
  .then(() => {
    console.log('Deployment completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('Deployment failed:', error)
    process.exit(1)
  })
