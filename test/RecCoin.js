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

  let _decimals = 18;

  const initialSupply = BigInt(1000);

  beforeEach(async function () {
    // To get the ContractFactory and Signers.
    RecCoin = await ethers.getContractFactory("RecCoin");
    [owner, account1, account2, ...accountss] = await ethers.getSigners();

    // Deploy the RecCoin contract
    recCoin = await RecCoin.deploy("RecCoin", "REC", initialSupply);

    console.log("RecCoin contract successfully deployed");
    console.log(`-----------------------------------------------`)
  });

  // Test to ascertain that the owner is rightly set
  describe("deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recCoin.owner()).to.equal(owner.address);
      console.log("Owner set correctly as " + owner.address);
      console.log(`-----------------------------------------------`)
    });

    // Test to ascertain the correct total supply of RecCoin.
    it("should set the correct total supply", async function () {
      const totalSupply = await recCoin.totalSupply();

      // Calculate the expected total supply based on the smart contract specification
      const expectedTotalSupply = initialSupply * BigInt(10 ** _decimals);

      // Assert that the total supply matches the expected total supply
      expect(totalSupply).to.equal(expectedTotalSupply);
    });


    // Test to ascertain that the total supply of RecCoin is assigned to the owner.
    it("Should assign the total supply to the owner", async function () {
      expect(await recCoin.balanceOf(owner.address)).to.equal(initialSupply * BigInt(10 ** _decimals));
      console.log("Total supply of " + recCoin.balanceOf(owner.address) + " assigned to the owner");
      const ownerBalance = await recCoin.balanceOf(owner.address);
      const totalSupply = await recCoin.totalSupply();
      console.log("Total supply of " + initialSupply * BigInt(10 ** _decimals) + " assigned to the owner");
      console.log("New Owner balance:", BigInt(ownerBalance).toString());

      console.log(`-----------------------------------------------`)
    });



    // The following are tests on the transfer function of the RecCoin smart contract - line 62 of RecCoin.sol
    describe("transfer", function () {
      it("Should transfer tokens from sender to account1 and account2", async function () {
        const initialBalanceOwner = await recCoin.balanceOf(owner.address);
        const initialBalanceAccount1 = await recCoin.balanceOf(account1.address);
        const initialBalanceAccount2 = await recCoin.balanceOf(account2.address);
        //const amount = BigInt(80);
        const amount = 80;

        // Call the transfer function to account1
        await recCoin.connect(owner).transfer(account1.address, amount);

        // Get the new balances after transferring to account1
        const ownerBalanceOnDebit1 = await recCoin.balanceOf(owner.address);
        const newBalanceAccount1 = await recCoin.balanceOf(account1.address);

        // Check and confirm balances after transferring to account1
        expect(ownerBalanceOnDebit1).to.equal(initialBalanceOwner.sub(amount));
        expect(newBalanceAccount1).to.equal(initialBalanceAccount1.add(amount));
        console.log(amount.toString() + " RecCoin transferred from " + owner.address + " to " + account1.address);
        console.log("Owner balance now: " + ownerBalanceOnDebit1.toString());
        console.log(`-----------------------------------------------`)


        // Call the transfer function to account2
        await recCoin.connect(owner).transfer(account2.address, amount);

        // Get the new balances after transferring to account2
        const ownerBalanceOnDebit2 = await recCoin.balanceOf(owner.address);
        const newBalanceAccount2 = await recCoin.balanceOf(account2.address);

        // Check and confirm balances after transferring to account2
        expect(ownerBalanceOnDebit2).to.equal(ownerBalanceOnDebit1.sub(amount));
        expect(newBalanceAccount2).to.equal(initialBalanceAccount2.add(amount));

        console.log(amount.toString() + " RecCoin transferred from " + owner.address + " to " + account2.address);

        console.log("Final balance of owner with address: " + owner.address + " is " + ownerBalanceOnDebit2.toString());
        console.log("New balance of account1 with address: " + account1.address + " is " + newBalanceAccount1.toString());
        console.log("New balance of account2 with address: " + account2.address + " is " + newBalanceAccount2.toString());
        console.log(`-----------------------------------------------`);
      });
    });


    // The following are tests on the approve function of the RecCoin smart contract - line 74 of RecCoin.sol
    describe("approve", function () {
      it("should approve token transfer", async function () {
        const amountToApprove = 80;
        const spender = account1.address;
        const initialAllowance = await recCoin.allowance(owner.address, spender);

        // owner approves token transfer
        await recCoin.connect(owner).approve(spender, amountToApprove);

        // Verify the allowance so granted
        const newAllowance = await recCoin.allowance(owner.address, spender);
        console.log("Initial approved spending:", initialAllowance.toString());
        console.log("New approved spending:", newAllowance.toString());

        expect(newAllowance).to.equal(initialAllowance.add(amountToApprove));
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

        console.log(Number(ethers.utils.formatEther(initialAllowance)) + " Is initial allowance " + Number(ethers.utils.formatEther(updatedAllowance)) + " is updated allowance ");
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

    // The following are tests on the mint function of the RecCoin smart contract - line 109 of RecCoin.sol
    describe("mint", function () {
      it("should mint tokens and update the total supply and balance of the recipient", async function () {
        const recipient = account1.address;
        const amountToMint = ethers.BigNumber.from(500);

        // Get the initial total supply and balance of the recipient
        const initialTotalSupply = await recCoin.totalSupply();
        const initialRecipientBalance = await recCoin.balanceOf(recipient);

        // Mint tokens to the recipient
        await recCoin.mint(recipient, amountToMint);

        // Get the final total supply and balance of the recipient
        const finalTotalSupply = await recCoin.totalSupply();
        const finalRecipientBalance = await recCoin.balanceOf(recipient);

        // Assert that the total supply and recipient balance have been updated correctly
        expect(finalTotalSupply).to.equal(initialTotalSupply.add(amountToMint));
        expect(finalRecipientBalance).to.equal(initialRecipientBalance.add(amountToMint));

        // Log the minting details for verification
        console.log(amountToMint.toString() + " RecCoin minted to " + recipient);
        console.log("New total supply:", finalTotalSupply.toString());
        console.log("New balance of recipient:", finalRecipientBalance.toString());
        console.log("-----------------------------------------------");
      });

      it("should revert if minting to the zero address", async function () {
        const zeroAddress = ethers.constants.AddressZero;
        const amountToMint = ethers.BigNumber.from(500);

        // Verify that minting to the zero address reverts with the expected error message
        await expect(recCoin.mint(zeroAddress, amountToMint)).to.be.revertedWith("RecCoin: mint to the zero address");
      });
    });


    // This tests the mint function of the Recoin smart contract - line 98 of Recoin.sol
    describe("mint", function () {
      it("should mint tokens to the specified account", async function () {
        const initialSupply = await recCoin.totalSupply();
        const amount = 100;

        await recCoin.connect(owner).mint(account1.address, amount);

        const balance = await recCoin.balanceOf(account1.address);
        const newTotalSupply = await recCoin.totalSupply();

        console.log("Recipient Balance:", balance.toString());
        console.log("New Total Supply:", newTotalSupply.toString());

        expect(balance).to.equal(amount);
        expect(newTotalSupply).to.equal(initialSupply.add(amount));
      });

      it("should revert when minting to the zero address", async function () {
        const amount = 100;

        await expect(
          recCoin.connect(owner).mint(
            "0x0000000000000000000000000000000000000000",
            amount
          )
        ).to.be.revertedWith("RecCoin: mint to the zero address");
      });

      it("should update the balance of the specified account", async function () {
        const amount = 100;

        await recCoin.connect(owner).mint(account1.address, amount);

        const balance = await recCoin.balanceOf(account1.address);

        console.log("Recipient Balance:", balance.toString());

        expect(balance).to.equal(amount);
      });

      it("should increase the total supply by the minted amount", async function () {
        const initialSupply = await recCoin.totalSupply();
        const amount = 100;

        await recCoin.connect(owner).mint(account1.address, amount);

        const newTotalSupply = await recCoin.totalSupply();

        console.log("New Total Supply:", newTotalSupply.toString());

        expect(newTotalSupply).to.equal(initialSupply.add(amount));
      });
    });


/*
    // This tests the burn function of the RecCoin smart contract - line 114 of RecCoin.sol

    describe("burn", function () {
      it("Burns a specified number of tokens and removes it from total supply", async function () {

        const amountToBurn = 80;

        // Total supply before burning some ReCoin
        const initialTotalSupply = await recCoin.totalSupply();
        console.log("Total supply before burning some Recoin is ", initialTotalSupply.toString())

        // Call the burn function
        const burnIt = await recCoin.burn(amountToBurn);
        // Wait for the transaction to complete
        await burnIt.wait(1)

        // Total supply after burning some ReCoin

        const finalTotalSupply = await recCoin.totalSupply();
        console.log("Total supply after burning some Recoin is ", finalTotalSupply.toString())

        expect(finalTotalSupply).to.equal(initialTotalSupply.sub(amountToBurn));
      });


      it("Ensure only the owner can burn ReCoin", async function () {

        const amountToBurn = 80;
        // Connect account2 to the contract. This returns the instance of the contract...
        // ..with account2 connected
        const recoinAccount2 = await recCoin.connect(account2);

        // Revert with an error when a non-owner wants to burn some reCoin
        await expect(recoinAccount2.burn(amountToBurn)).to.be.revertedWith("Ownable: caller is not the owner")
      });

      it("Prevents burning of more than the ReCoin total supply", async function () {
        // Total supply before burning some ReCoin is 1000
        const initialTotalSupply = await recCoin.totalSupply();

        const amountToBurn = 2000;

        console.log("Total supply before burning some Recoin is ", initialTotalSupply.toString())

        // Revert with an error when the owner attemps to burn more than the total supply
        await expect(recCoin.burn(amountToBurn)).to.be.revertedWith("RecCoin: burn amount exceeds balance")
      });
    });*/
  });
});
