// Using the Chai assertion library
const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("RecCoin", function () {
  let RecCoin;
  let recCoin;
  let owner;
  let account1;
  let account2;
  let accountss;
  // assume base denomination of the RecCoin token is handled using ethers.utils.parseEther
  let _decimals = 0;

  const initialSupply = ethers.utils.parseEther("1000");

  beforeEach(async function () {
    // To get the ContractFactory and Signers.
    RecCoin = await ethers.getContractFactory("RecCoin");
    [owner, account1, account2, ...accountss] = await ethers.getSigners();

    // Deploy the RecCoin contract
    recCoin = await RecCoin.deploy("RecCoin", "REC", _decimals, initialSupply);

    console.log("RecCoin contract successfully deployed");
    console.log(`-----------------------------------------------`)
  });

  // Test to ascertain that the owner is rightly set
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recCoin.owner()).to.equal(owner.address);
      console.log("Owner set correctly as " + owner.address);
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain the correct total supply of RecCoin.
    it("Should set the correct total supply", async function () {
      expect(await recCoin.totalSupply()).to.equal(initialSupply.mul(10 ** _decimals));
      //console.log("Total supply: " + totalSupply);
      const totalSupply = await recCoin.totalSupply();
      console.log("Total supply:", Number(ethers.utils.formatEther(totalSupply)));
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain that the total supply of RecCoin is assigned to the owner.
    it("Should assign the total supply to the owner", async function () {
      expect(await recCoin.balanceOf(owner.address)).to.equal(initialSupply.mul(10 ** _decimals));
      //console.log("Total supply of " + recCoin.balanceOf(owner.address) +  " assigned to the owner");
      const ownerBalance = await recCoin.balanceOf(owner.address);
      const totalSupply = await recCoin.totalSupply();
      console.log("Total supply of " + Number(ethers.utils.formatEther(totalSupply)) + " assigned to the owner");
      console.log("New Owner balance:", Number(ethers.utils.formatEther(ownerBalance)));
      console.log(`-----------------------------------------------`)
    });
  });

  // The following are tests on the transfer function of the RecCoin smart contract - line 63 of RecCoin.sol
  describe("Transfers", function () {
    it("Should transfer tokens from sender to account1 and account2", async function () {
      const initialBalanceOwner = await recCoin.balanceOf(owner.address);
      const initialBalanceAccount1 = await recCoin.balanceOf(account1.address);
      const initialBalanceAccount2 = await recCoin.balanceOf(account2.address);
      const amount = ethers.utils.parseEther("80");

      // Call the transfer function to account1
      await recCoin.connect(owner).transfer(account1.address, amount);

      // Get the new balances after transferring to account1
      const ownerBalanceOnDebit1 = await recCoin.balanceOf(owner.address);
      const newBalanceAccount1 = await recCoin.balanceOf(account1.address);

      // Check and confirm balances after transferring to account1
      expect(ownerBalanceOnDebit1).to.equal(initialBalanceOwner.sub(amount));
      expect(newBalanceAccount1).to.equal(initialBalanceAccount1.add(amount));
      console.log(Number(ethers.utils.formatEther(amount)) + " RecCoin transferred from " + owner.address + " to " + account1.address);
      console.log("Owner balance now: " + Number(ethers.utils.formatEther(ownerBalanceOnDebit1)));
      console.log(`-----------------------------------------------`)

      // Call the transfer function to account2
      await recCoin.connect(owner).transfer(account2.address, amount);

      // Get the new balances after transferring to account2
      const ownerBalanceOnDebit2 = await recCoin.balanceOf(owner.address);
      const newBalanceAccount2 = await recCoin.balanceOf(account2.address);

      // Check and confirm balances after transferring to account2
      expect(ownerBalanceOnDebit2).to.equal(ownerBalanceOnDebit1.sub(amount));
      expect(newBalanceAccount2).to.equal(initialBalanceAccount2.add(amount));

      console.log(Number(ethers.utils.formatEther(amount)) + " RecCoin transferred from " + owner.address + " to " + account2.address);
      console.log("Final balance of owner with address: " + owner.address + " is " + Number(ethers.utils.formatEther(ownerBalanceOnDebit2)));
      console.log("New balance of account1 with address: " + account1.address + " is " + Number(ethers.utils.formatEther(newBalanceAccount1)));
      console.log("New balance of account2 with address: " + account2.address + " is " + Number(ethers.utils.formatEther(newBalanceAccount2)));
    });
  });

  // The following are tests on the transferFrom function of the RecCoin smart contract - line 87 of RecCoin.sol
   describe("transferFrom", function () {
    it("Should transfer tokens from sender to recipient", async function () {
      const sender = owner.address;
      const recipient = account2.address;
      const amount = ethers.utils.parseEther("50");

      // Check initial balances
      const initialSenderBalance = await recCoin.balanceOf(sender);
      const initialRecipientBalance = await recCoin.balanceOf(recipient);

      // Set the allowance for account1 to spend tokens from owner's address using the approve function
      await recCoin.connect(owner).approve(account1.address, amount);

      // Perform transferFrom
      await recCoin.connect(account1).transferFrom(sender, recipient, amount);

      // Check final balances
      const finalSenderBalance = await recCoin.balanceOf(sender);
      const finalRecipientBalance = await recCoin.balanceOf(recipient);

      // Check if balances have updated correctly
      expect(finalSenderBalance).to.equal(initialSenderBalance.sub(amount));
      expect(finalRecipientBalance).to.equal(initialRecipientBalance.add(amount));

      console.log(Number(ethers.utils.formatEther(amount)) + " RecCoin transferred from " + owner.address + " to " + account2.address);
      console.log("Owner balance now: " + Number(ethers.utils.formatEther(finalSenderBalance)));
      console.log(`-----------------------------------------------`)

    });

    it("Should update allowance after transferFrom", async function () {
      const sender = owner.address;
      const recipient = account2.address;
      const amount = ethers.utils.parseEther("50");

       // Set the allowance for account1 to spend tokens from owner's address using the approve function
       await recCoin.connect(owner).approve(account1.address, amount);


      // Check initial allowance
      const initialAllowance = await recCoin.allowance(sender, account1.address);

    
      // Perform transferFrom
      await recCoin.connect(account1).transferFrom(sender, recipient, amount);

      // Check updated allowance
      const updatedAllowance = await recCoin.allowance(sender, account1.address);

      // Check if allowance has updated correctly
      expect(updatedAllowance).to.equal(initialAllowance.sub(amount));

      console.log(Number(ethers.utils.formatEther(initialAllowance)) + " Is initial allowance " + Number(ethers.utils.formatEther(updatedAllowance))  + " is updated allowance ");
    });

    it("Should revert transferFrom if allowance is exceeded", async function () {
      const sender = owner.address;
      const recipient = account2.address;
      const amount = ethers.utils.parseEther("150");

      // Perform transferFrom and expect it to revert
      await expect(recCoin.connect(account1).transferFrom(sender, recipient, amount)).to.be.revertedWith(
        "RecCoin: transfer amount exceeds allowance"
      );
    });
  });
    // This tests the mint function of the Recoin smart contract - line 98 of Recoin.sol
    describe("mint", function () {
      it("should mint tokens to the specified account", async function () {
       const amount = 100;
  
       // Mint tokens to the specified account
       await recCoin.connect(owner).mint(account1.address, amount);
  
       // check balance of the specified account
       const balance = await recCoin.balanceOf(account1.address);
  
       // Check the total supply of tokens in the contract
       const totalSupply = await recCoin.totalSupply();
  
       // Verify that the balance of the specified account is equal to the minted amount
       expect(balance).to.equal(amount);
  
       // Verify that the total supply has increased by the minted amount
       expect(totalSupply).to.equal(1000000000000000000100n);
      });
  
       it("should revert if minting to the zero address", async function () {
       const amount = 100;
  
       // Expect the minting to the zero address to revert with an error message
       await expect(recCoin.connect(owner).mint("0x0000000000000000000000000000000000000000", amount))
        .to.be.revertedWith("RecCoin: mint to the zero address");
      }); 
  });
  // This tests the burn function of the RecCoin smart contract - line 114 of RecCoin.sol
  describe("burn", function () {
    it("Burns a specified number of tokens and removes it from total supply", async function () {

      const amountToBurn = ethers.utils.parseEther("80");

      // Total supply before burning some ReCoin
      const initialTotalSupply = await recCoin.totalSupply();
      console.log("Total supply before burning some Recoin is ", Number(ethers.utils.formatEther(initialTotalSupply)))

      // Call the burn function
      const burnIt = await recCoin.burn(amountToBurn);
      // Wait for the transaction to complete
      await burnIt.wait(1)

      // Total supply after burning some ReCoin

      const finalTotalSupply = await recCoin.totalSupply();
      console.log("Total supply after burning some Recoin is ", Number(ethers.utils.formatEther(finalTotalSupply)))

      expect(finalTotalSupply).to.equal(initialTotalSupply.sub(amountToBurn));
    });


    it("Ensure only the owner can burn ReCoin", async function () {

      const amountToBurn = ethers.utils.parseEther("80");
      // Connect account2 to the contract. This returns the instance of the contract...
      // ..with account2 connected
      const recoinAccount2 = await recCoin.connect(account2);

      // Revert with an error when a non-owner wants to burn some reCoin
      await expect(recoinAccount2.burn(amountToBurn)).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it("Prevents burning of more than the ReCoin total supply", async function () {
      // Total supply before burning some ReCoin is 1000
      const initialTotalSupply = await recCoin.totalSupply();

      const amountToBurn = ethers.utils.parseEther("2000");

      console.log("Total supply before burning some Recoin is ", Number(ethers.utils.formatEther(initialTotalSupply)))

      // Revert with an error when the owner attemps to burn more than the total supply
      await expect(recCoin.burn(amountToBurn)).to.be.revertedWith("RecCoin: burn amount exceeds balance")
    });
  });
});

