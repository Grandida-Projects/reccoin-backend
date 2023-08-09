const { expect } = require("chai");

describe("Recycle", function () {
  let recycle;
  let recylox;
  let company;

  beforeEach(async function () {
    let _decimals = 18;
    const initialSupply = BigInt(1000);

    // Get the ContractFactory and Signers.
    Recylox = await ethers.getContractFactory("Recylox");
    [owner, company, secondCompany, thirdCompany, picker, picker2] =
      await ethers.getSigners();

    // Deploy the Recylox contract
    recylox = await Recylox.deploy("Recylox", "REC", initialSupply);

    console.log("Recylox contract successfully deployed");

    const Recycle = await ethers.getContractFactory("Recycle");
    recycle = await Recycle.deploy(recylox.address);
    await recycle.deployed();
    console.log("Recycle contract successfully deployed");
  });
  // register a company
  describe("registerCompany", function () {
    it("should register a new company", async function () {
      const companyName = "Test-Company A";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          maxPricePerKg,
          isActive
        );

      const registeredCompany = await recycle.companies(company.address);
      expect(registeredCompany.name).to.equal(companyName);
      expect(registeredCompany.minWeightRequirement).to.equal(
        minWeightRequirement
      );
      expect(registeredCompany.maxPricePerKg).to.equal(maxPricePerKg);
      expect(registeredCompany.active).to.equal(isActive);
    });

    // Attempt to re-register an already registered company - expect a revert
    it("should revert if company is already registered", async function () {
      const companyName = "Test-Company A";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          maxPricePerKg,
          isActive
        );

      await expect(
        recycle
          .connect(company)
          .registerCompany(
            companyName,
            minWeightRequirement,
            maxPricePerKg,
            isActive
          )
      ).to.be.revertedWith(
        "Recycle: Sorry you can't register twice edit your info if you wish to"
      );
    });
  });


  // The following are tests on the getRegisteredCompanyCount and getCompany functions of the Recycle smart contract - lines 307 and 454 of Recycle.sol
  describe("getRegisteredCompanyCount", function () {
    it("should return the correct count of registered companies", async function () {
      // Register a new company using the first signer
      const companyName1 = "Company 1";
      const minWeightRequirement1 = 100;
      const maxPricePerKg1 = 10;
      const isActive1 = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName1,
          minWeightRequirement1,
          maxPricePerKg1,
          isActive1
        );

      // Register a second company using a different signer
      const companyName2 = "Company 2";
      const minWeightRequirement2 = 200;
      const maxPricePerKg2 = 20;
      const isActive2 = true;

      await recycle
        .connect(secondCompany)
        .registerCompany(
          companyName2,
          minWeightRequirement2,
          maxPricePerKg2,
          isActive2
        );

      // Register a third company using another different signer
      const companyName3 = "Company 3";
      const minWeightRequirement3 = 300;
      const maxPricePerKg3 = 30;
      const isActive3 = true;

      await recycle
        .connect(thirdCompany)
        .registerCompany(
          companyName3,
          minWeightRequirement3,
          maxPricePerKg3,
          isActive3
        );

      // Get the registered company count
      const registeredCompanyCount = await recycle.getRegisteredCompanyCount();

      // Log key details to the console
      console.log(
        "Registered Company Count:",
        registeredCompanyCount.toNumber()
      );

      // Check if the count corresponds to what is expected.
      expect(registeredCompanyCount).to.equal(3);

      // also test the getCompany function
      
      const companyName1Address = await company.getAddress();
      const companyName2Address = await secondCompany.getAddress();
      const companyName3Address = await thirdCompany.getAddress();
  
      // Call the getCompany function
      const companyName1Info = await recycle.getCompany(companyName1Address);
      const ccompanyName2Info = await recycle.getCompany(companyName2Address);
      const ccompanyName3Info = await recycle.getCompany(companyName3Address);
  
      // Verify the returned company information
      expect(companyName1Info.name).to.equal("Company 1");
      expect(companyName1Info.minWeightRequirement).to.equal(100);
      expect(companyName1Info.maxPricePerKg).to.equal(10);
      expect(companyName1Info.active).to.equal(true);
  
      expect(ccompanyName2Info.name).to.equal("Company 2");
      expect(ccompanyName2Info.minWeightRequirement).to.equal(200);
      expect(ccompanyName2Info.maxPricePerKg).to.equal(20);
      expect(ccompanyName2Info.active).to.equal(true);

      expect(ccompanyName3Info.name).to.equal("Company 3");
      expect(ccompanyName3Info.minWeightRequirement).to.equal(300);
      expect(ccompanyName3Info.maxPricePerKg).to.equal(30);
      expect(ccompanyName3Info.active).to.equal(true);
      
    });
  });

  // The following are tests on the updateCompanyName function of the Recycle smart contract - line 332 of Recycle.sol
  describe("updateCompanyName", function () {
    it("should update company name", async function () {
      // Register a new company
      const companyName = "Grandida Company";

      // Register the company address on Recylox
      await recycle
        .connect(company)
        .registerCompany(companyName, 100, 10, true);

      // Update the company name
      const newName = "Grandida Testers Company";
      await recycle.connect(company).updateCompanyName(newName);

      // Ascertain that company name is updated correctly
      const registeredCompany = await recycle.companies(company.address);
      expect(registeredCompany.name).to.equal(newName);
      console.log("Updated company name: ", registeredCompany.name);
    });
  });

  // The following are tests on the getRegisteredCompanyCount function of the Recycle smart contract - line 375 of Recycle.sol
  describe("updateCompanyActiveStatus", function () {
    it("should update the active status of a company", async function () {
      // Register a new company for the trial
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          maxPricePerKg,
          isActive
        );

      // Update the active status of the company - First check
      const newActiveStatus = false;
      await recycle.connect(company).updateCompanyActiveStatus(newActiveStatus);

      // Ascertain that the active status is updated correctly
      const updatedCompany = await recycle.companies(company.address);
      expect(updatedCompany.active).to.equal(newActiveStatus);
      console.log(
        "Updated company active status on first check: ",
        updatedCompany.active
      );

      // A counter-update of the active status of the company - Second check
      const newerActiveStatus = true;
      await recycle
        .connect(company)
        .updateCompanyActiveStatus(newerActiveStatus);

      // Ascertain that the active status is counter-updated correctly
      const updatedCompanyCheckTwo = await recycle.companies(company.address);
      expect(updatedCompanyCheckTwo.active).to.equal(newerActiveStatus);
      console.log(
        "Updated company active status on second check: ",
        updatedCompanyCheckTwo.active
      );
    });
  });

  // The following are tests on the editCompany function of the Recycle smart contract - line 299 of Recycle.sol
  describe("editCompany", function () {
    it("should edit a new company", async function () {
      // Register a new company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;
      // Connect the company's account to the contract
      const connectedcompany = await recycle.connect(company);
      //Call the contract function
      const registerCompany = await connectedcompany.registerCompany(
        companyName,
        minWeightRequirement,
        maxPricePerKg,
        isActive
      );

      await registerCompany.wait(1);

      // Edit company, using new details
      const newCompanyName = "Test Edit Company";
      const newMinWeightRequirement = 150;
      const newMaxPricePerKg = 20;
      const newIsActive = false;

      // Call the contract function
      const editCompany = await connectedcompany.editCompany(
        newCompanyName,
        newMinWeightRequirement,
        newMaxPricePerKg,
        newIsActive
      );

      const receipt = await editCompany.wait(1);

      // Check if the function emits events with these values
      expect(editCompany, "CompanyEdited", {
        arg1: newCompanyName,
        arg2: newMinWeightRequirement,
        arg3: newMaxPricePerKg,
        arg4: newIsActive,
      });
      //~~ You can also use receipt.events[0].args to check for events
    });
  });

  // The following are tests on the updateCompanyMinWeightRequirement function of the Recycle smart contract - line 343 of Recycle.sol
  describe("updateCompanyMinWeightRequirement", function () {
    it("should update the company's Minimum weight requirement", async function () {
      // Register a new company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;
      // Connect the company's account to the contract
      const connectedcompany = await recycle.connect(company);
      //Call the contract function
      const registerCompany = await connectedcompany.registerCompany(
        companyName,
        minWeightRequirement,
        maxPricePerKg,
        isActive
      );
      await registerCompany.wait(1);

      // Update the weight requirement to a new value
      const newMinWeightRequirement = 200;

      // Call the contract function
      const updateWeight =
        await connectedcompany.updateCompanyMinWeightRequirement(
          newMinWeightRequirement
        );

      const receipt = await updateWeight.wait(1);

      // Check if the function emits events with these values
      expect(updateWeight, "CompanyMinWeightRequirementUpdated", {
        arg1: company.address,
        arg2: newMinWeightRequirement,
      });

      //~~ You can also use receipt.events[0].args to check for events
    });
  });

  // The following are tests on the registerPicker function of the Recycle smart contract - line 387 of Recycle.sol
  describe("registerPicker", function () {
    it("should register a picker", async function () {
      // Register a new picker
      const pickerName = "Kobiko";
      const pickerEmail = "kobiko@gmail.com";
      // Connect the picker's account to the contract
      const connectedPicker = await recycle.connect(picker);
      //Call the contract function
      const registerPicker = await connectedPicker.registerPicker(
        pickerName,
        pickerEmail
      );

      await registerPicker.wait(1);

      // Ascertain the picker is registered correctly
      const registeredPicker = await recycle.pickers(picker.address);
      expect(registeredPicker.name).to.equal(pickerName);

      expect(registeredPicker.email).to.equal(pickerEmail);
    });
  });

  // The following are tests on the getPicker function of the Recycle smart contract - line 412 of Recycle.sol
  describe("getPicker", function () {
    it("should get a registered picker", async function () {
      // Register a new picker
      const pickerName = "Kobiko";
      const pickerEmail = "kobiko@gmail.com";
      // Connect the picker's account to the contract
      const connectedPicker = await recycle.connect(picker);
      //Call the contract function
      const registerPicker = await connectedPicker.registerPicker(
        pickerName,
        pickerEmail
      );

      await registerPicker.wait(1);

      // Check if picker can be gotten from the function
      const gottenPicker = await recycle.getPicker(picker.address);
      expect(gottenPicker[0]).to.equal(pickerName);
    });
  });

  // The following are tests on the getRegisteredPickerCount function of the Recycle smart contract - line 420 of Recycle.sol
  describe("getRegisteredPickerCount", function () {
    it("should return the correct count of registered pickers", async function () {
      // Register a new picker
      const pickerName = "Kobiko";
      const pickerEmail = "kobiko@gmail.com";
      // Connect the picker's account to the contract
      const connectedPicker = await recycle.connect(picker);
      //Call the contract function
      const registerPicker = await connectedPicker.registerPicker(
        pickerName,
        pickerEmail
      );

      // Register a second company using a different signer
      const picker2Name = "David Grass";
      const picker2Email = "grass@gmail.com";
      // Connect the picker's account to the contract
      const connectedPicker2 = await recycle.connect(picker2);
      //Call the contract function
      const registerPicker2 = await connectedPicker2.registerPicker(
        picker2Name,
        picker2Email
      );
      // Get the number of registered pickers
      const registeredPickerCount = await recycle.getRegisteredPickerCount();

      // Check if the number of pickers corresponds to what is expected(2 pickers).
      expect(registeredPickerCount).to.equal(2);
    });
  });

  // The following are tests on the updateCompanyMaxPricePerKg function of the Recycle smart contract - line 352 of Recycle.sol
  describe("updateCompanyMaxPricePerKg", function () {
    it("should update the maximum price per kg for a company", async function () {
      // Register a new company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const initialMaxPricePerKg = 10;
      const updatedMaxPricePerKg = 15;
      const isActive = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          initialMaxPricePerKg,
          isActive
        );

      // Call the updateCompanyMaxPricePerKg function to update the maximum price per kg
      await recycle
        .connect(company)
        .updateCompanyMaxPricePerKg(updatedMaxPricePerKg);

      // Retrieve the updated company details
      const registeredCompany = await recycle.companies(company.address);

      // Assert that the maximum price per kg has been updated correctly
      expect(registeredCompany.maxPricePerKg).to.equal(updatedMaxPricePerKg);
      console.log(
        "Updated maximum price per kg: ",
        registeredCompany.maxPricePerKg.toString()
      );
    });

    it("should revert if the maximum price per kg is set to zero", async function () {
      // Register a new company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const initialMaxPricePerKg = 10;
      const isActive = true;

      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          initialMaxPricePerKg,
          isActive
        );

      // Try to update the maximum price per kg to zero
      const zeroMaxPricePerKg = 0;

      // Assert that updating the maximum price per kg to zero reverts with an error
      await expect(
        recycle.connect(company).updateCompanyMaxPricePerKg(zeroMaxPricePerKg)
      ).to.be.revertedWith("Recycle: Set price must be greater than zero");
    });
  });

  // The following is a test on the updatePickerName function of the Recycle smart contract line 470
  describe("editPicker", function () {
    it("should edit a picker", async function () {
      // Register a new picker
      const pickerName = "Kobiko";
      const pickerEmail = "kobiko@gmail.com";
      await recycle.connect(picker).registerPicker(pickerName, pickerEmail);

      // Edit the picker
      const newPickerName = "Updated Picker";
      const newPickerEmail = "updatedpicker@gmail.com";
      const editPickerTx = await recycle
        .connect(picker)
        .editPicker(newPickerName, newPickerEmail);
      await editPickerTx.wait();

      // Retrieve the updated picker details
      const updatedPicker = await recycle.pickers(picker.address);

      // Check if the picker details are updated correctly
      expect(updatedPicker.name).to.equal(newPickerName);
      expect(updatedPicker.email).to.equal(newPickerEmail);

      // Check if the event is emitted with the correct values
      expect(editPickerTx, "PickerEdited")
        .to.emit(recycle, "PickerEdited")
        .withArgs(picker.address, newPickerName, newPickerEmail);
    });
  });

  // The following is a test on the updatePickerName function of the Recycle smart contract line 494
  describe("updatePickerName", function () {
    it("should update picker Name", async function () {
      // Register a new picker
      const pickerName = "John";
      const pickerEmail = "charles@gmail.com";
      await recycle.connect(picker).registerPicker(pickerName, pickerEmail);

      //Update the picker name
      const newName = "John2";
      await recycle.connect(picker).updatePickerName(newName);

      // Ascertain that picker name is updated correctly
      const registeredPicker = await recycle.pickers(picker.address);
      expect(registeredPicker.name).to.equal(newName);
      console.log("Updated picker name: ", registeredPicker.name);
    });
  });

  // The following is a test on the updatePickerEmail function of the Recycle smart contract line 509
  describe("updatePickerEmail", function () {
    it("should update picker email", async function () {
      // Register a new picker
      const pickerName = "John";
      const pickerEmail = "charles@gmail.com";
      await recycle.connect(picker).registerPicker(pickerName, pickerEmail);

      //Update the picker email
      const newEmail = "ebuka@example.com";
      await recycle.connect(picker).updatePickerEmail(newEmail);

      // Ascertain that picker email is updated correctly
      const registeredPicker = await recycle.pickers(picker.address);
      expect(registeredPicker.email).to.equal(newEmail);
      console.log("Updated picker email: ", registeredPicker.email);
    });
  });

  //The following is a test on the depositPlastic function of the Recycle smart contract line 526
  describe("depositPlastic", function () {
    it("should deposit plastic successfully", async function () {
      // Register a company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;
      await recycle
        .connect(company)
        .registerCompany(
          companyName,
          minWeightRequirement,
          maxPricePerKg,
          isActive
        );

      // Define the input parameters for the depositPlastic function
      const companyAddress = company.address;
      const weight = 100;

      // Register a new picker
      const pickerName = "ebuka";
      const pickerEmail = "ebuka@gmail.com";
      await recycle.connect(picker).registerPicker(pickerName, pickerEmail);

      // Connect the picker signer to the contract
      const connectedRecycle = recycle.connect(picker);

      // Call the depositPlastic function
      const transactionId = await connectedRecycle.depositPlastic(
        companyAddress,
        weight
      );

      // Retrieve the transaction details
      const transaction = await recycle.transactions(0);

      // Assert the transaction details are correct
      expect(transaction.companyAddress).to.equal(companyAddress);
      expect(transaction.pickerAddress).to.equal(picker.address);
      expect(transaction.weight).to.equal(weight);
      expect(transaction.isApproved).to.equal(false);

      // Retrieve the picker details
      const pickerDetails = await recycle.pickers(picker.address);

      // Assert the picker's weightDeposited is updated correctly
      expect(pickerDetails.weightDeposited).to.equal(weight);

      // Retrieve the total number of transactions
      const totalTransactions = await recycle.totalTransactions();
      // Assert the total number of transactions is updated correctly
      expect(totalTransactions).to.equal(1);

      // Emit PlasticDeposited event
      const events = await recycle.queryFilter("PlasticDeposited");
      const eventArgs = events[0].args;

      // Assert the emitted event is correct
      expect(eventArgs.pickerAddress).to.equal(picker.address);
      expect(eventArgs.companyAddress).to.equal(companyAddress);
      expect(eventArgs.weight).to.equal(weight);
    });
  });

  // This tests the  function validatePlastic of the Recycle smart contract - line 560 of Recycle.sol
  it("should reject invalid plastic transaction", async function () {
    // Register a company
    await recycle.connect(company).registerCompany("Company", 100, 10, true);

    // Get a picker registerd
    await recycle
      .connect(picker)
      .registerPicker("Picker", "picker@example.com");

    // picker deposits plastic
    const weight = 50;
    await recycle.connect(picker).depositPlastic(company.address, weight);

    // Attempt to get transaction ID
    const pickerData = await recycle.getPicker(picker.address);
    const transactionId = pickerData.transactions[0];

    // Attempt to validate the plastic transaction
    await expect(
      recycle.connect(company).validatePlastic(transactionId)
    ).to.be.revertedWith(
      "Recycle: Weight of plastic deposited is below the minimum accepted weight of the company"
    );

    // Attempt to check if the transaction is still marked as not approved
    const transaction = await recycle.transactions(transactionId);
    expect(transaction.isApproved).to.equal(false);
  });

  // This test the  function payPicker of the Recycle smart contract - line 586 of Recycle.sol
  describe("payPicker", function () {
    const amount = 10 * 100; // price per weight * deposited weight

    beforeEach(async () => {
      // Approve recyle contract to transfer token
      let transaction = await recylox
        .connect(company)
        .approve(recycle.address, amount);
      result = await transaction.wait();
    });

    it("pay a picker", async function () {
      // ==== Transfer from deployer's account to the company's account
      // The company's contract instance
      const connectedCompany = await recycle.connect(company);
      // Register a company
      await connectedCompany.registerCompany("Company", 10, 10, true);
      // Make company a recepient
      const recipient = company.address;
      // Want to transfer 500 recyclox from the deployer to the company
      const amountToTransfer = ethers.BigNumber.from(500).mul(
        ethers.BigNumber.from("10").pow(18)
      );

      // Transfer tokens from the owner of the contract to the company
      await recylox.transfer(recipient, amountToTransfer);

      // Check company balance after transfer
      const companyRecycloxBalance = await connectedCompany.balanceOf();

      // Get a picker registered
      const connectedPicker = await recycle.connect(picker);
      await connectedPicker.registerPicker("Picker", "josh@example.com");

      const initialPickerBalance = await connectedPicker.balanceOf();

      // picker deposits plastic
      const weight = 100;
      await connectedPicker.depositPlastic(company.address, weight);

      // Get the transaction ID
      const pickerData = await connectedPicker.getPicker(picker.address);

      const transactionId = pickerData.transactions[0];

      // Validate the plastic by the company
      await connectedCompany.validatePlastic(transactionId);

      // Pay the picker
      await connectedCompany.payPicker(transactionId);

      //Check balance after payment
      const finalBalance = await connectedPicker.balanceOf();

      // Check if the picker balance equals the amount that was transfered to the picker
      expect(finalBalance).to.equal(amount);
    });
  });

  // This test the  function balanceOf  the Recycle smart contract - line 250 of Recycle.sol
  it("should return the correct balance", async function () {
    const initialBalance = 100; // Set the initial balance here

    // Transfer some tokens to the address
    await recylox.transfer(picker.address, initialBalance);

    // Get the balance of the address
    const balance = await recylox.balanceOf(picker.address);

    // Assert that the balance is correct
    expect(balance).to.equal(initialBalance);
  });
});
