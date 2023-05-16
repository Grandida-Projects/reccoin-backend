// Using the Chai assertion library
const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("RecCoin", function() {
  let RecCoin;
  let recCoin;
  let owner;
  let account1;
  let account2;
  let accountss;
  // assumme base denomination of the RecCoin uses granular precision of RecCoin/10^3
  let _decimals = 3;

  const initialSupply = ethers.utils.parseEther("1000");

  beforeEach(async function() {
    // To get the ContractFactory and Signers.
    RecCoin = await ethers.getContractFactory("RecCoin");
    [owner, account1, account2, ...accountss] = await ethers.getSigners();

    // Deploy the RecCoin contract
    recCoin = await RecCoin.connect(owner).deploy("RecCoin", "REC", _decimals, initialSupply);

    console.log("RecCoin contract successfully deployed");
    console.log(`-----------------------------------------------`)
  });
  
  // Test to ascertain that the owner is rightly set
  describe("Deployment", function() {
    it("Should set the right owner", async function() {
      expect(await recCoin.owner()).to.equal(owner.address);
      console.log("Owner set correctly as " + owner.address);
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain the correct total supply of RecCoin.
    it("Should set the correct total supply", async function() {
      expect(await recCoin.totalSupply()).to.equal(initialSupply.mul(10 ** _decimals));
      //console.log("Total supply: " + totalSupply);
      const totalSupply = await recCoin.totalSupply();
      console.log("Total supply:", totalSupply.toString());
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain that the total supply of RecCoin is assigned to the owner.
    it("Should assign the total supply to the owner", async function() {
      expect(await recCoin.balanceOf(owner.address)).to.equal(initialSupply.mul(10 ** _decimals));
      //console.log("Total supply of " + recCoin.balanceOf(owner.address) +  " assigned to the owner");
      const ownerBalance = await recCoin.balanceOf(owner.address);
      const totalSupply = await recCoin.totalSupply();
      console.log("Total supply of " + totalSupply.toString() +  " assigned to the owner");
      console.log("New Owner balance:", ownerBalance.toString());
      console.log(`-----------------------------------------------`)
    });
  });

  // The following are tests on the transfer function of the RecCoin smart contract - line 63 of RecCoin.sol
  describe("Transfers", function() {
    it("Should transfer tokens from sender to account1", async function() {
      const initialBalanceOwner = await recCoin.balanceOf(owner.address);
      const initialBalanceRecipient = await recCoin.balanceOf(account1.address);
      const amount = ethers.utils.parseEther("80");

      // Call the transfer function
      await recCoin.connect(owner).transfer(account1.address, amount);

      // Check and confirm respective balances of RecCoin
      expect(await recCoin.balanceOf(owner.address)).to.equal(initialBalanceOwner.sub(amount));
      expect(await recCoin.balanceOf(account1.address)).to.equal(initialBalanceRecipient.add(amount));

      console.log("RecCoin successfully transferred from " + owner.address + " to " + account1.address);
    });
  });
});
