// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

// Deploy script for Recylox smart contract on Hardhat

// Import Hardhat environment and Ethereum libraries
const { ethers } = require("hardhat");

async function main() {
  // Set up Ethereum wallet
  const [deployer] = await ethers.getSigners();

  // Grab Recylox.sol
  console.log("Deploying the Recylox contract with the account:", deployer.address);
  // Set up the Recylox contract factory
  const Recylox = await ethers.getContractFactory("Recylox");
  const initialSupply = ethers.utils.parseEther("1000000");
  // Deploy the Recylox contract
  const recylox = await Recylox.deploy("Recylox", "REC", initialSupply);

  await recylox.deployed();
  // display success and address
  console.log("Recylox contract deployed to address:", recylox.address);

 
  // Grab Recycle.sol
  console.log("Deploying contracts with the account:", deployer.address);  
  // Set up the Recycle contract factory
  const Recycle = await ethers.getContractFactory('Recycle');
  const recycle = await Recycle.deploy(recylox.address);
  await recycle.deployed(); 
  console.log("Recycle contract deployed to address:", recycle.address);
  
}


// Run the main function
main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
