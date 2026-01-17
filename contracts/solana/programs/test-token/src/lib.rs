use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("testToken111111111111111111111111111111111");

/// TestToken program for testing and faucet purposes.
/// Mint and burn functions are open to anyone - no access control restrictions.
/// This is intentional for testing environments and faucet functionality.
#[program]
pub mod test_token {
    use super::*;

    /// Mint tokens to an account. Open to anyone for testing and faucet purposes.
    /// Uses a PDA as mint authority that anyone can derive and sign for.
    /// @param amount The amount of tokens to mint
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let seeds = &["mint".as_bytes(), &[ctx.bumps.mint_authority]];
        let signer = &[&seeds[..]];
        
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;
        
        emit!(MintEvent {
            account: ctx.accounts.to.key(),
            amount,
        });
        
        Ok(())
    }

    /// Burn tokens from an account. Open to anyone for testing purposes.
    /// Anyone can burn tokens from any account they have access to.
    /// @param amount The amount of tokens to burn
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.from.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        
        emit!(BurnEvent {
            account: ctx.accounts.from.key(),
            amount,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    /// CHECK: Mint authority PDA - anyone can derive this and use it to mint
    #[account(
        seeds = [b"mint"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    /// CHECK: Authority that owns the token account (anyone can burn if they own the account)
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[event]
pub struct MintEvent {
    pub account: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BurnEvent {
    pub account: Pubkey,
    pub amount: u64,
}

