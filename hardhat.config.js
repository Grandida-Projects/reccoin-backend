require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy")
/*
require("dotenv").config({ path: ".env" });
/** @type import('hardhat/config').HardhatUserConfig */
/*
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
*/

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337, // Chain ID of the Hardhat local blockchain
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};
