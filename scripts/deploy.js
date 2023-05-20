// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

// Deploy script for RecCoin smart contract on Hardhat

// Import Hardhat environment and Ethereum libraries
const { ethers } = require("hardhat");

async function main() {
  // Set up Ethereum wallet
  const [deployer] = await ethers.getSigners();

  // Grab RecCoin.sol
  console.log("Deploying the RecCoin contract with the account:", deployer.address);
  // Set up the RecCoin contract factory
  const RecCoin = await ethers.getContractFactory("RecCoin");
  // Deploy the RecCoin contract
  const recCoin = await RecCoin.deploy("RecCoin", "REC", 0, ethers.utils.parseEther("1000"));
  // display success and address
  console.log("RecCoin contract deployed to address:", recCoin.address);

 
  // Grab Recycle.sol
  console.log("Deploying contracts with the account:", deployer.address);  
  // Set up the Recycle contract factory
  const Recycle = await ethers.getContractFactory("Recycle");  
  // Deploy the Recycle contract
  const recycle = await Recycle.deploy();  
  console.log("Recycle contract deployed to address:", recycle.address);
  
}


// Run the main function
main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
