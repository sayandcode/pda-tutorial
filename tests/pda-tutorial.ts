import { expect } from "chai";
import { wallet, program } from "./_utils";
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
    const vaultBalBefore = await program.provider.connection.getBalance(
      vaultPda
    );
    expect(vaultBalBefore).to.equal(0);
    const userBalBefore = await program.provider.connection.getBalance(
      wallet.publicKey
    );

    const updatedMsg = "Hello, Solana!";
    await program.methods.update(updatedMsg).rpc({ commitment: "confirmed" });
    const accountData = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );
    expect(accountData.message).to.equal(updatedMsg);

    const vaultBalAfter = await program.provider.connection.getBalance(
      vaultPda
    );
    const userBalAfter = await program.provider.connection.getBalance(
      wallet.publicKey
    );
    expect(vaultBalAfter).to.be.greaterThan(vaultBalBefore);
    expect(userBalAfter).to.be.lessThan(userBalBefore);
    expect(userBalBefore - userBalAfter).to.be.greaterThan(
      // greater than, cause network fees
      vaultBalAfter - vaultBalBefore
    );
  });

  it("Delete Message Account", async () => {
    const userBalBefore = await program.provider.connection.getBalance(
      wallet.publicKey
    );
    const vaultBalBefore = await program.provider.connection.getBalance(
      vaultPda
    );
    const messageAccountBalBefore = (
      await program.provider.connection.getAccountInfo(messagePda)
    ).lamports;

    await program.methods.delete().rpc({ commitment: "confirmed" });
    const accountData = await program.account.messageAccount.fetchNullable(
      messagePda,
      "confirmed"
    );
    expect(accountData).to.equal(null);

    const userBalAfter = await program.provider.connection.getBalance(
      wallet.publicKey
    );
    const vaultBalAfter = await program.provider.connection.getBalance(
      vaultPda
    );
    expect(vaultBalAfter).to.equal(0);
    expect(userBalAfter).to.be.lessThan(
      userBalBefore + vaultBalBefore + messageAccountBalBefore
    ); // less than cause network fees
  });
});
