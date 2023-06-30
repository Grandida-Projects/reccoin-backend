// Using the Chai assertion library
const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("Recylox", function () {
  let Recylox;
  let recylox;
  let owner;
  let account1;
  let account2;
  let accountss;

  let _decimals = 18;

  const initialSupply = BigInt(1000);

  beforeEach(async function () {
    // To get the ContractFactory and Signers.
    Recylox = await ethers.getContractFactory("Recylox");
    [owner, account1, account2, ...accountss] = await ethers.getSigners();

    // Deploy the Recylox contract
    recylox = await Recylox.deploy("Recylox", "REC", initialSupply);

    console.log("Recylox contract successfully deployed");
    console.log(`-----------------------------------------------`)
  });

  // Test to ascertain that the owner is rightly set
  describe("deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recylox.owner()).to.equal(owner.address);
      console.log("Owner set correctly as " + owner.address);
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain the correct total supply of Recylox.
    it("should set the correct total supply", async function () {
      const totalSupply = await recylox.totalSupply();

      // Calculate the expected total supply based on the smart contract specification
      const expectedTotalSupply = initialSupply * BigInt(10 ** _decimals);

      // Assert that the total supply matches the expected total supply
      expect(totalSupply).to.equal(expectedTotalSupply);
    });


    // Test to ascertain that the total supply of Recylox is assigned to the owner.
    it("Should assign the total supply to the owner", async function () {
      expect(await recylox.balanceOf(owner.address)).to.equal(initialSupply * BigInt(10 ** _decimals));
      console.log("Total supply of " + recylox.balanceOf(owner.address) + " assigned to the owner");
      const ownerBalance = await recylox.balanceOf(owner.address);
      const totalSupply = await recylox.totalSupply();
      console.log("Total supply of " + initialSupply * BigInt(10 ** _decimals) + " assigned to the owner");
      console.log("New Owner balance:", BigInt(ownerBalance).toString());

      console.log(`-----------------------------------------------`)
    });



    // The following are tests on the transfer function of the Recylox smart contract - line 62 of Recylox.sol
    describe("transfer", function () {
      it("Should transfer tokens from sender to account1 and account2", async function () {
        const initialBalanceOwner = await recylox.balanceOf(owner.address);
        const initialBalanceAccount1 = await recylox.balanceOf(account1.address);
        const initialBalanceAccount2 = await recylox.balanceOf(account2.address);
        const amount = ethers.BigNumber.from(80).mul(ethers.BigNumber.from("10").pow(_decimals));

        // Call the transfer function to account1
        await recylox.connect(owner).transfer(account1.address, amount);

        // Get the new balances after transferring to account1
        const ownerBalanceOnDebit1 = await recylox.balanceOf(owner.address);
        const newBalanceAccount1 = await recylox.balanceOf(account1.address);

        // Check and confirm balances after transferring to account1
        expect(ownerBalanceOnDebit1).to.equal(initialBalanceOwner.sub(amount));
        expect(newBalanceAccount1).to.equal(initialBalanceAccount1.add(amount));
        console.log(amount.toString() + " Recylox transferred from " + owner.address + " to " + account1.address);
        console.log("Owner balance now: " + ownerBalanceOnDebit1.toString());
        console.log(`-----------------------------------------------`)


        // Call the transfer function to account2
        await recylox.connect(owner).transfer(account2.address, amount);

        // Get the new balances after transferring to account2
        const ownerBalanceOnDebit2 = await recylox.balanceOf(owner.address);
        const newBalanceAccount2 = await recylox.balanceOf(account2.address);

        // Check and confirm balances after transferring to account2
        expect(ownerBalanceOnDebit2).to.equal(ownerBalanceOnDebit1.sub(amount));
        expect(newBalanceAccount2).to.equal(initialBalanceAccount2.add(amount));

        console.log(amount.toString() + " Recylox transferred from " + owner.address + " to " + account2.address);

        console.log("Final balance of owner with address: " + owner.address + " is " + ownerBalanceOnDebit2.toString());
        console.log("New balance of account1 with address: " + account1.address + " is " + newBalanceAccount1.toString());
        console.log("New balance of account2 with address: " + account2.address + " is " + newBalanceAccount2.toString());
        console.log(`-----------------------------------------------`);
      });
    });


    // The following are tests on the approve function of the Recylox smart contract - line 74 of Recylox.sol
    describe("approve", function () {
      it("should approve token transfer", async function () {
        const amountToApprove = ethers.BigNumber.from(80).mul(ethers.BigNumber.from("10").pow(_decimals));
        
        const spender = account1.address;
        const initialAllowance = await recylox.allowance(owner.address, spender);

        // owner approves token transfer
        await recylox.connect(owner).approve(spender, amountToApprove);

        // Verify the allowance so granted
        const newAllowance = await recylox.allowance(owner.address, spender);
        console.log("Initial approved spending:", initialAllowance.toString());
        console.log("New approved spending:", newAllowance.toString());

        expect(newAllowance).to.equal(initialAllowance.add(amountToApprove));
      });
    });


    // The following are tests on the transferFrom function of the Recylox smart contract - line 87 of Recylox.sol
    describe("transferFrom", function () {
      it("Should transfer tokens from sender to recipient", async function () {
        const sender = owner.address;
        const recipient = account2.address;
        const amount = ethers.utils.parseEther("50");

        // Check initial balances
        const initialSenderBalance = await recylox.balanceOf(sender);
        const initialRecipientBalance = await recylox.balanceOf(recipient);

        // Set the allowance for account1 to spend tokens from owner's address using the approve function
        await recylox.connect(owner).approve(account1.address, amount);

        // Perform transferFrom
        await recylox.connect(account1).transferFrom(sender, recipient, amount);

        // Check final balances
        const finalSenderBalance = await recylox.balanceOf(sender);
        const finalRecipientBalance = await recylox.balanceOf(recipient);

        // Check if balances have updated correctly
        expect(finalSenderBalance).to.equal(initialSenderBalance.sub(amount));
        expect(finalRecipientBalance).to.equal(initialRecipientBalance.add(amount));

        console.log(Number(ethers.utils.formatEther(amount)) + " Recylox transferred from " + owner.address + " to " + account2.address);
        console.log("Owner balance now: " + Number(ethers.utils.formatEther(finalSenderBalance)));
        console.log(`-----------------------------------------------`)

      });

      it("Should update allowance after transferFrom", async function () {
        const sender = owner.address;
        const recipient = account2.address;
        const amount = ethers.BigNumber.from(50).mul(ethers.BigNumber.from("10").pow(_decimals));

        // Set the allowance for account1 to spend tokens from owner's address using the approve function
        await recylox.connect(owner).approve(account1.address, amount);


        // Check initial allowance
        const initialAllowance = await recylox.allowance(sender, account1.address);


        // Perform transferFrom
        await recylox.connect(account1).transferFrom(sender, recipient, amount);

        // Check updated allowance
        const updatedAllowance = await recylox.allowance(sender, account1.address);

        // Check if allowance has updated correctly
        expect(updatedAllowance).to.equal(initialAllowance.sub(amount));

        console.log(Number(ethers.utils.formatEther(initialAllowance)) + " Is initial allowance " + Number(ethers.utils.formatEther(updatedAllowance)) + " is updated allowance ");
      });

      it("Should revert transferFrom if allowance is exceeded", async function () {
        const sender = owner.address;
        const recipient = account2.address;
        const amount = ethers.utils.parseEther("150");

        // Perform transferFrom and expect it to revert
        await expect(recylox.connect(account1).transferFrom(sender, recipient, amount)).to.be.revertedWith(
          "Recylox: transfer amount exceeds allowance"
        );
      });
    });

    // The following are tests on the mint function of the Recylox smart contract - line 109 of Recylox.sol
    describe("mint", function () {
      it("should mint tokens and update the total supply and balance of the recipient", async function () {
        const recipient = account1.address;
        const amountToMint = ethers.BigNumber.from(500).mul(ethers.BigNumber.from("10").pow(_decimals));

        // Get the initial total supply and balance of the recipient
        const initialTotalSupply = await recylox.totalSupply();
        const initialRecipientBalance = await recylox.balanceOf(recipient);

        // Mint tokens to the recipient
        await recylox.mint(recipient, amountToMint);

        // Get the final total supply and balance of the recipient
        const finalTotalSupply = await recylox.totalSupply();
        const finalRecipientBalance = await recylox.balanceOf(recipient);

        // Assert that the total supply and recipient balance have been updated correctly
        expect(finalTotalSupply).to.equal(initialTotalSupply.add(amountToMint));
        expect(finalRecipientBalance).to.equal(initialRecipientBalance.add(amountToMint));

        // Log the minting details for verification
        console.log(amountToMint.toString() + " Recylox minted to " + recipient);
        console.log("New total supply:", finalTotalSupply.toString());
        console.log("New balance of recipient:", finalRecipientBalance.toString());
        console.log("-----------------------------------------------");
      });

      it("should revert if minting to the zero address", async function () {
        const zeroAddress = ethers.constants.AddressZero;
        const amountToMint = ethers.BigNumber.from(500).mul(ethers.BigNumber.from("10").pow(_decimals));

        // Verify that minting to the zero address reverts with the expected error message
        await expect(recylox.mint(zeroAddress, amountToMint)).to.be.revertedWith("Recylox: mint to the zero address");
      });
    });


    // This tests the mint function of the Recoin smart contract - line 98 of Recoin.sol
    describe("mint", function () {
      it("should mint tokens to the specified account", async function () {
        const initialSupply = await recylox.totalSupply();
        const amount = ethers.BigNumber.from(100).mul(ethers.BigNumber.from("10").pow(_decimals));

        await recylox.connect(owner).mint(account1.address, amount);

        const balance = await recylox.balanceOf(account1.address);
        const newTotalSupply = await recylox.totalSupply();

        console.log("Recipient Balance:", balance.toString());
        console.log("New Total Supply:", newTotalSupply.toString());

        expect(balance).to.equal(amount);
        expect(newTotalSupply).to.equal(initialSupply.add(amount));
      });

      it("should revert when minting to the zero address", async function () {
        const amount = ethers.BigNumber.from(100).mul(ethers.BigNumber.from("10").pow(_decimals));

        await expect(
          recylox.connect(owner).mint(
            "0x0000000000000000000000000000000000000000",
            amount
          )
        ).to.be.revertedWith("Recylox: mint to the zero address");
      });

      it("should update the balance of the specified account", async function () {
        const amount = ethers.BigNumber.from(100).mul(ethers.BigNumber.from("10").pow(_decimals));

        await recylox.connect(owner).mint(account1.address, amount);

        const balance = await recylox.balanceOf(account1.address);

        console.log("Recipient Balance:", balance.toString());

        expect(balance).to.equal(amount);
      });

      it("should increase the total supply by the minted amount", async function () {
        const initialSupply = await recylox.totalSupply();
        const amount = ethers.BigNumber.from(100).mul(ethers.BigNumber.from("10").pow(_decimals));

        await recylox.connect(owner).mint(account1.address, amount);

        const newTotalSupply = await recylox.totalSupply();

        console.log("New Total Supply:", newTotalSupply.toString());

        expect(newTotalSupply).to.equal(initialSupply.add(amount));
      });
    });



    // This tests the burn function of the Recylox smart contract - line 114 of Recylox.sol

    describe("burn", function () {
      it("Burns a specified number of tokens and removes it from total supply", async function () {

        const amountToBurn = ethers.BigNumber.from(80).mul(ethers.BigNumber.from("10").pow(_decimals));

        // Total supply before burning some ReCoin
        const initialTotalSupply = await recylox.totalSupply();
        console.log("Total supply before burning some Recoin is ", initialTotalSupply.toString())

        // Call the burn function
        const burnIt = await recylox.burn(amountToBurn);
        // Wait for the transaction to complete
        await burnIt.wait(1)

        // Total supply after burning some ReCoin

        const finalTotalSupply = await recylox.totalSupply();
        console.log("Total supply after burning some Recoin is ", finalTotalSupply.toString())

        expect(finalTotalSupply).to.equal(initialTotalSupply.sub(amountToBurn));
      });


      it("Ensure only the owner can burn ReCoin", async function () {

        const amountToBurn = ethers.BigNumber.from(80).mul(ethers.BigNumber.from("10").pow(_decimals));
        // Connect account2 to the contract. This returns the instance of the contract...
        // ..with account2 connected
        const recoinAccount2 = await recylox.connect(account2);

        // Revert with an error when a non-owner wants to burn some reCoin
        await expect(recoinAccount2.burn(amountToBurn)).to.be.revertedWith("Ownable: caller is not the owner")
      });

      it("Prevents burning of more than the ReCoin total supply", async function () {
        // Total supply before burning some ReCoin is 1000
        const initialTotalSupply = await recylox.totalSupply();

        // attempt to burn 2000 tokens 
        // format 2000 in appropriate decimal places. 
        const amountToBurn = ethers.BigNumber.from("2000").mul(ethers.BigNumber.from("10").pow(_decimals));

        console.log("Total supply before burning some Recoin is ", initialTotalSupply.toString())

        // Revert with an error when the owner attemps to burn more than the total supply
        await expect(recylox.burn(amountToBurn)).to.be.revertedWith("Recylox: burn amount exceeds balance")
      });
    });
  });
});
