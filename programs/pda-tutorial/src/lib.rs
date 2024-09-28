use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("BGsHZyRbdfesUCRXcyhFszGUxhcRCjkFz73fuPwxLkPf");

#[program]
pub mod pda {
    use super::*;

    pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
        msg!("Create Message: {}", message);
        let account_data = &mut ctx.accounts.message_account;
        account_data.user = ctx.accounts.user.key();
        account_data.message = message;
        account_data.bump = ctx.bumps.message_account;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
        msg!("Update Message: {}", message);
        let transfer_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault_account.to_account_info(), // TODO: try other signer
        };
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_accounts,
        );
        system_program::transfer(cpi_context, 1_000_000)?;
        ctx.accounts.message_account.message = "abc".to_string();
        let account_data = &mut ctx.accounts.message_account;
        account_data.message = message;
        Ok(())
    }

    pub fn delete(ctx: Context<Delete>) -> Result<()> {
        msg!("Delete Message");
        let user_key = ctx.accounts.user.key();
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];

        let transfer_accounts = Transfer {
            from: ctx.accounts.vault_account.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        };
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_accounts,
        )
        .with_signer(signer_seeds);
        system_program::transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(message: String)] // todo: run tests with differently named parameter here
pub struct Create<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"message", user.key().as_ref()],
        bump,
        payer=user,
        space = 8+32+4+message.len()+1
    )]
    pub message_account: Account<'info, MessageAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(message: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        realloc = 8 + 32 +4+ message.len() + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub message_account: Account<'info, MessageAccount>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        close = user
    )]
    pub message_account: Account<'info, MessageAccount>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()], 
        bump
    )]
    pub vault_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>, // TODO: try a different type
}

#[account]
pub struct MessageAccount {
    user: Pubkey,
    message: String,
    bump: u8,
}
