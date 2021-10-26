const EthBlocks = artifacts.require("EthBlocks");
const Minter = artifacts.require("Minter");
// import { hashPersonalMessage } from "ethereumjs-util";
contract("EthBlocks", (accounts) => {
  let ethblocks, minter;
  before(async () => {
    ethblocks = await EthBlocks.deployed();
    minter = await Minter.deployed();
  });
  it("Should return the symbol,name, baseURI and correct minter and ethblocks", async function () {
    assert.equal(await ethblocks.name(), "Eth Blocks");
    assert.equal(await ethblocks.symbol(), "ETHB");
    assert.equal(await ethblocks.baseTokenURI(), "ipfs://");
    assert.equal(await minter.ethBlock(), EthBlocks.address);
    assert.equal(await ethblocks.minter(), Minter.address);
  });
  it("Should have correct owner, signer and beneficiary", async function () {
    assert.equal(await ethblocks.owner(), accounts[0]);
    assert.equal(await minter.signer(), accounts[1]);
    assert.equal(await minter.beneficiary(), accounts[2]);
  });
  it("Should generate correct hash, and mint and correct owner", async function () {
    const hash = await minter.getMessageHash(
      accounts[3],
      4526542,
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd",
      "ipfsHash121212",
      "500000000"
    );
    assert.equal(
      hash,
      "0x378bd1aa0d01e576d47080d942fb1f004ff4f53a8c383c4f67ab2cc7599850d7"
    );
    const signature = await web3.eth.sign(hash, accounts[1]);
    const sigBuffer = Buffer.from(signature.replace("0x", ""), "hex");
    sigBuffer[sigBuffer.length - 1] = sigBuffer[sigBuffer.length - 1] + 27;
    await minter.mint(
      accounts[3],
      4526542,
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd",
      "ipfsHash121212",
      "500000000",
      "0x" + sigBuffer.toString("hex"),
      { value: "500000000" }
    );
    assert.equal(await ethblocks.ownerOf(4526542), accounts[3]);
    assert.equal(await ethblocks.tokenURI(4526542), "ipfs://ipfsHash121212");
    const blockHash = await ethblocks.blockHashes(4526542);
    assert.equal(
      blockHash,
      "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd"
    );
    const tokenId = await ethblocks.tokenOfOwnerByIndex(accounts[3], 0);
    assert.equal(await ethblocks.balanceOf(accounts[3]), 1);
    assert.equal(await ethblocks.balanceOf(accounts[1]), 0);
    assert.equal(tokenId.toString(), 4526542);
  });
  it("should fail", async function () {
    try {
      await await ethblocks.mint(
        accounts[3],
        4526542,
        "0x4d035f21bec3661c24ed8cdef6f3e13a814e434db5574c598d72e8771a64b8cd",
        "ipfsHash121212"
      );
      assert.fail("The transaction should have thrown an error");
    } catch (err) {
      assert.include(
        err.message,
        "EthBlocks: caller is not the minter",
        "The error message should contain 'EthBlocks: caller is not the minter'"
      );
    }
  });
  it("Should return correct royalties", async function () {
    const royalties = await ethblocks.getRaribleV2Royalties(0);
    assert.equal(royalties[0].account, accounts[2]);
    assert.equal(royalties[0].value, 250);
    let mintableRoyalty = await ethblocks.royaltyInfo(0, 20000);
    assert.equal(mintableRoyalty.receiver, accounts[2]);
    assert.equal(mintableRoyalty.royaltyAmount.toNumber(), 500);
    await ethblocks.changeRoyaltyAddress(accounts[3]);
    await ethblocks.changeRoyaltyBasisPoints(1000);
    mintableRoyalty = await ethblocks.royaltyInfo(0, 20000);
    assert.equal(mintableRoyalty.receiver, accounts[3]);
    assert.equal(mintableRoyalty.royaltyAmount.toNumber(), 2000);
  });
  it("Should support correct interfaces", async function () {
    assert.equal(await ethblocks.supportsInterface("0x2a55205a"), true); //ERC2981 mintable
    assert.equal(await ethblocks.supportsInterface("0xcad96cca"), true); //Rarible RoyaltiesV2
    assert.equal(await ethblocks.supportsInterface("0x80ac58cd"), true); //ERC721
    assert.equal(await ethblocks.supportsInterface("0x5b5e139f"), true); //ERC721Metadata
    assert.equal(await ethblocks.supportsInterface("0x780e9d63"), true); //ERC721Enumerable
    assert.equal(await ethblocks.supportsInterface("0x01ffc9a7"), true); //ERC165
  });
});
