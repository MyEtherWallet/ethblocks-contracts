const EthBlocks = artifacts.require("EthBlocks");
const Minter = artifacts.require("Minter");
module.exports = async (deployer, network, addresses) => {
  let proxyRegistryAddress = "";
  if (network === "rinkeby") {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }
  await deployer
    .deploy(EthBlocks, proxyRegistryAddress, "Eth Blocks", "ETHB")
    .then(() => {
      return deployer
        .deploy(Minter, addresses[1], addresses[2], EthBlocks.address)
        .then(() => {
          return EthBlocks.deployed().then((_ethBlocks) => {
            return _ethBlocks.changeMinter(Minter.address);
          });
        });
    });
};
