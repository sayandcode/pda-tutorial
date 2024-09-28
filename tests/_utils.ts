import * as anchor from "@coral-xyz/anchor";
import { Pda } from "../target/types/pda";

const defaultProvider = anchor.AnchorProvider.env();
anchor.setProvider(defaultProvider);

const program = anchor.workspace.pda as anchor.Program<Pda>;
const wallet = defaultProvider.wallet;

export { wallet, program };
