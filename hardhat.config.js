require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      gas: "auto",
      gasPrice: "auto",
      initialBaseFeePerGas: 0,
      accounts: {
        count: 10,
        initialBalance: "100000000000000000000" // 100 ETH
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};

