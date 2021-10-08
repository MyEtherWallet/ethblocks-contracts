const EthBlocks = artifacts.require("EthBlocks");
// import { hashPersonalMessage } from "ethereumjs-util";
contract("EthBlocks", (accounts) => {
  let ethblocks;
  before(async () => {
    ethblocks = await EthBlocks.deployed();
  });
  it("Should return the symbol and name", async function () {
    assert.equal(await ethblocks.name(), "Eth Blocks");
    assert.equal(await ethblocks.symbol(), "ETHB");
  });
  it("Should have correct owner, signer and beneficiary", async function () {
    assert.equal(await ethblocks.owner(), accounts[0]);
    assert.equal(await ethblocks.signer(), accounts[1]);
    assert.equal(await ethblocks.beneficiary(), accounts[2]);
  });
  it("Should generate correct hash, and mint and correct owner", async function () {
    const hash = await ethblocks.getMessageHash(
      accounts[3],
      4526542,
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd",
      "ipfsHash121212",
      "500000000"
    );
    assert.equal(
      hash,
      "0xb12a86e40835b3537db032b1154824b9cd0a88de6627599ee8956b0726195a42"
    );
    const signature = await web3.eth.sign(hash, accounts[1]);
    const sigBuffer = Buffer.from(signature.replace("0x", ""), "hex");
    sigBuffer[sigBuffer.length - 1] = sigBuffer[sigBuffer.length - 1] + 27;
    await ethblocks.mint(
      accounts[3],
      4526542,
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd",
      "ipfsHash121212",
      "500000000",
      "0x" + sigBuffer.toString("hex"),
      { value: "500000000" }
    );
    assert.equal(
      await ethblocks.ownerOf(
        "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
      ),
      accounts[3]
    );
    assert.equal(
      await ethblocks.tokenURI(
        "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
      ),
      "ipfs://ipfsHash121212"
    );
    const blockHashBN = await ethblocks.blockHashes(4526542);
    assert.equal(
      "0x" + blockHashBN.toString("hex"),
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
    );
    assert.equal(
      "0x" + blockHashBN.toString("hex"),
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
    );
    const tokenId = await ethblocks.tokenOfOwnerByIndex(accounts[3], 0);
    assert.equal(await ethblocks.balanceOf(accounts[3]), 1);
    assert.equal(await ethblocks.balanceOf(accounts[1]), 0);
    assert.equal(
      "0x" + tokenId.toString("hex"),
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
    );
  });
  it("Should correctly convert hash to id", async function () {
    const tokenIdBN = await ethblocks.hashToTokenId(
      "0xdd166b46de2a5df9153e0d107383e3b670f8e32488f35073e29acc64ad4eb780"
    );
    assert.equal(
      tokenIdBN.toString(),
      "100000750569779127133654391210248331194789449127784754681573510034235543435136"
    );
    assert.equal(
      await ethblocks.tokenIdToHash(
        "100000750569779127133654391210248331194789449127784754681573510034235543435136"
      ),
      "0xdd166b46de2a5df9153e0d107383e3b670f8e32488f35073e29acc64ad4eb780"
    );
  });
});
