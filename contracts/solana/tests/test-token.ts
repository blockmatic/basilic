import type { Program } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
import { createAccount, createMint, getAccount, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair, PublicKey } from '@solana/web3.js'
import { expect } from 'chai'
import type { TestToken } from '../target/types/test_token'

describe('test-token', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.TestToken as Program<TestToken>

  let mint: PublicKey
  let mintAuthority: PublicKey
  let _mintAuthorityBump: number
  let user1: Keypair
  let user2: Keypair
  let user1TokenAccount: PublicKey
  let user2TokenAccount: PublicKey

  before(async () => {
    // Create test users
    user1 = Keypair.generate()
    user2 = Keypair.generate()

    // Airdrop SOL to users
    const sig1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    )
    const sig2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    )

    // Wait for airdrops to be confirmed
    await provider.connection.confirmTransaction(sig1, 'confirmed')
    await provider.connection.confirmTransaction(sig2, 'confirmed')

    // Find mint authority PDA
    const [mintAuthorityPDA, mintAuthorityBumpValue] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint')],
      program.programId,
    )
    mintAuthority = mintAuthorityPDA
    _mintAuthorityBump = mintAuthorityBumpValue

    // Create mint
    mint = await createMint(
      provider.connection,
      user1, // payer
      mintAuthority, // mint authority
      mintAuthority, // freeze authority (can be null)
      9, // decimals
    )

    // Create token accounts
    user1TokenAccount = await createAccount(
      provider.connection,
      user1, // payer
      mint, // mint
      user1.publicKey, // owner
    )

    user2TokenAccount = await createAccount(
      provider.connection,
      user2, // payer
      mint, // mint
      user2.publicKey, // owner
    )
  })

  it('Mints tokens to user1', async () => {
    const amount = new anchor.BN(1000 * 10 ** 9) // 1000 tokens with 9 decimals

    await program.methods
      .mintTokens(amount)
      .accounts({
        mint: mint,
        mintAuthority: mintAuthority,
        to: user1TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    const account = await getAccount(provider.connection, user1TokenAccount)
    expect(Number(account.amount)).to.equal(Number(amount))
  })

  it('Anyone can mint tokens', async () => {
    const amount = new anchor.BN(500 * 10 ** 9)

    // User2 mints for user1
    await program.methods
      .mintTokens(amount)
      .accounts({
        mint: mint,
        mintAuthority: mintAuthority,
        to: user1TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()

    const account = await getAccount(provider.connection, user1TokenAccount)
    expect(Number(account.amount)).to.be.greaterThan(Number(amount))
  })

  it('Burns tokens from user1', async () => {
    const accountBefore = await getAccount(provider.connection, user1TokenAccount)
    const balanceBefore = Number(accountBefore.amount)
    const burnAmount = new anchor.BN(200 * 10 ** 9)

    await program.methods
      .burnTokens(burnAmount)
      .accounts({
        mint: mint,
        from: user1TokenAccount,
        authority: user1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()

    const accountAfter = await getAccount(provider.connection, user1TokenAccount)
    const balanceAfter = Number(accountAfter.amount)
    expect(balanceAfter).to.equal(balanceBefore - Number(burnAmount))
  })

  it('Multiple users can mint independently', async () => {
    const amount1 = new anchor.BN(1000 * 10 ** 9)
    const amount2 = new anchor.BN(2000 * 10 ** 9)

    // User1 mints for themselves
    await program.methods
      .mintTokens(amount1)
      .accounts({
        mint: mint,
        mintAuthority: mintAuthority,
        to: user1TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()

    // User2 mints for themselves
    await program.methods
      .mintTokens(amount2)
      .accounts({
        mint: mint,
        mintAuthority: mintAuthority,
        to: user2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user2])
      .rpc()

    const account1 = await getAccount(provider.connection, user1TokenAccount)
    const account2 = await getAccount(provider.connection, user2TokenAccount)

    expect(Number(account1.amount)).to.be.greaterThanOrEqual(Number(amount1))
    expect(Number(account2.amount)).to.equal(Number(amount2))
  })

  it('Mints zero amount', async () => {
    const accountBefore = await getAccount(provider.connection, user1TokenAccount)
    const balanceBefore = Number(accountBefore.amount)

    await program.methods
      .mintTokens(new anchor.BN(0))
      .accounts({
        mint: mint,
        mintAuthority: mintAuthority,
        to: user1TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()

    const accountAfter = await getAccount(provider.connection, user1TokenAccount)
    expect(Number(accountAfter.amount)).to.equal(balanceBefore)
  })

  it('Burns zero amount', async () => {
    const accountBefore = await getAccount(provider.connection, user1TokenAccount)
    const balanceBefore = Number(accountBefore.amount)

    await program.methods
      .burnTokens(new anchor.BN(0))
      .accounts({
        mint: mint,
        from: user1TokenAccount,
        authority: user1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user1])
      .rpc()

    const accountAfter = await getAccount(provider.connection, user1TokenAccount)
    expect(Number(accountAfter.amount)).to.equal(balanceBefore)
  })

  it('Verifies mint decimals', async () => {
    const mintInfo = await getMint(provider.connection, mint)
    expect(mintInfo.decimals).to.equal(9)
  })
})
