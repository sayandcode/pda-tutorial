import { assert, expect } from "chai";
import { wallet, program } from "./_utils";
import { PublicKey } from "@solana/web3.js";

describe("PDA Tutorial", () => {
  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("message"), wallet.publicKey.toBuffer()],
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
    const updatedMsg = "Hello, Solana!";
    await program.methods.update(updatedMsg).rpc({ commitment: "confirmed" });
    const accountData = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );
    expect(accountData.message).to.equal(updatedMsg);
  });

  it("Delete Message Account", async () => {
    // Implement delete test here
    await program.methods.delete().rpc({ commitment: "confirmed" });
    const accountData = await program.account.messageAccount.fetchNullable(
      messagePda,
      "confirmed"
    );
    expect(accountData).to.equal(null);
  });
});
