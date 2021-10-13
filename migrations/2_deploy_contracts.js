const EthBlocks = artifacts.require("EthBlocks");

module.exports = async (deployer, network, addresses) => {
  let proxyRegistryAddress = "";
  if (network === "rinkeby") {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }
  await deployer.deploy(
    EthBlocks,
    proxyRegistryAddress,
    addresses[1],
    addresses[2],
    "Eth Blocks",
    "ETHB"
  );
};
