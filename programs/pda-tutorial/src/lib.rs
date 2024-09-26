use anchor_lang::prelude::*;

declare_id!("BGsHZyRbdfesUCRXcyhFszGUxhcRCjkFz73fuPwxLkPf");

#[program]
pub mod pda_tutorial {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
