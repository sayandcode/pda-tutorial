use anchor_lang::prelude::*;

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
        let account_data = &mut ctx.accounts.message_account;
        account_data.message = message;
        Ok(())
    }

    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
        msg!("Delete Message");
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
}

#[account]
pub struct MessageAccount {
    user: Pubkey,
    message: String,
    bump: u8,
}
