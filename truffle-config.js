const rinkebyNodeUrl = "https://nodes.mewapi.io/rpc/rinkeby";
const mainnetNodeUrl = "https://nodes.mewapi.io/rpc/eth";
const MNEMONIC = process.env.MNEMONIC || "";

module.exports = {
  compilers: {
    solc: {
      version: "0.8.9",
    },
  },
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: "dfgdgf",
  },
  networks: {
    develop: {
      port: 8545,
      network_id: 20,
      accounts: 5,
      defaultEtherBalance: 500,
      blockTime: 1,
      provider: function () {
        return new HDWalletProvider(
          "toward vacant shaft dry open range skull adapt cram defense doll fatigue",
          "http://127.0.0.1:8545"
        );
      },
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(MNEMONIC, rinkebyNodeUrl);
      },
      gas: 5000000,
      network_id: 4,
    },
    live: {
      network_id: 1,
      provider: function () {
        return new HDWalletProvider(MNEMONIC, mainnetNodeUrl);
      },
      gas: 5000000,
      gasPrice: 5000000000,
    },
  },
};
