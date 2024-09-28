import * as anchor from "@coral-xyz/anchor";
import { Pda } from "../target/types/pda";
import { PublicKey } from "@solana/web3.js";

const defaultProvider = anchor.AnchorProvider.env();
anchor.setProvider(defaultProvider);

export const program = anchor.workspace.pda as anchor.Program<Pda>;
export const wallet = defaultProvider.wallet;

export async function getBal(pk: PublicKey) {
  return program.provider.connection.getBalance(pk);
}

export async function getTxnFees(txnHash: string) {
  const txnInfo = await program.provider.connection.getTransaction(txnHash, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  return txnInfo.meta.fee;
}
