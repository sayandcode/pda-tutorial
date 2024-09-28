import { expect } from "chai";
import { wallet, program, getBal, getTxnFees } from "./_utils";
import { PublicKey } from "@solana/web3.js";

describe("PDA Tutorial", () => {
  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("message"), wallet.publicKey.toBuffer()],
    program.programId
  );

  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    program.programId
  );

  it("Create Message Account", async () => {
    const msg = "Hello, World!";
    await program.methods.create(msg).rpc({ commitment: "confirmed" });

    const accountData = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );
    expect(accountData.message).to.equal(msg);
  });

  it("Update Message Account", async () => {
    const vaultBalBefore = await getBal(vaultPda);
    expect(vaultBalBefore).to.equal(0);
    const userBalBefore = await getBal(wallet.publicKey);
    const msgAccBalBefore = await getBal(messagePda);

    const updatedMsg = "Hello, Solana!";
    const txn = await program.methods
      .update(updatedMsg)
      .rpc({ commitment: "confirmed" });
    const networkFees = await getTxnFees(txn);

    const accountData = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );
    expect(accountData.message).to.equal(updatedMsg);

    const vaultBalAfter = await getBal(vaultPda);
    const userBalAfter = await getBal(wallet.publicKey);
    const msgAccBalAfter = await getBal(messagePda);

    expect(vaultBalAfter).to.be.greaterThan(vaultBalBefore);
    expect(userBalAfter).to.be.lessThan(userBalBefore);

    const userSpent = userBalBefore - userBalAfter;
    const msgAccExtraRent = msgAccBalAfter - msgAccBalBefore;
    expect(userSpent).to.be.closeTo(
      vaultBalAfter - vaultBalBefore + networkFees + msgAccExtraRent,
      10
    );
  });

  it("Delete Message Account", async () => {
    const userBalBefore = await getBal(wallet.publicKey);
    const vaultBalBefore = await getBal(vaultPda);
    const messageAccBalBefore = (
      await program.provider.connection.getAccountInfo(messagePda)
    ).lamports;

    const txn = await program.methods.delete().rpc({ commitment: "confirmed" });
    const accountData = await program.account.messageAccount.fetchNullable(
      messagePda,
      "confirmed"
    );
    expect(accountData).to.equal(null);

    const userBalAfter = await getBal(wallet.publicKey);
    const vaultBalAfter = await getBal(vaultPda);
    const networkFees = await getTxnFees(txn);
    expect(vaultBalAfter).to.equal(0);
    expect(userBalAfter).to.be.closeTo(
      userBalBefore + vaultBalBefore + messageAccBalBefore - networkFees,
      100
    );
  });
});
