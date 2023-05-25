// Import necessary libraries
const { expect } = require("chai");

// Define contract artifacts
const { ethers } = require("hardhat");
const { utils } = ethers;

describe("Recycle", function () {
  let owner;
  let recycle;
  let company;
  let secondCompany;
  let thirdCompany;
  let picker;

  beforeEach(async function () {
    // Deploy the contract and get the deployed instances
    // Assign test accounts to key players (owner, company, picker) in this contract 
    [owner, company, secondCompany, thirdCompany, picker] = await ethers.getSigners();
    const Recycle = await ethers.getContractFactory("Recycle");
    recycle = await Recycle.deploy();
    await recycle.deployed();
    console.log("Recycle contract successfully deployed");
    console.log(`-----------------------------------------------`);
  });


  // The following are tests on the registerCompany function of the Recycle smart contract - line 136 of Recycle.sol
  describe("registerCompany", function () {
    it("should register a new company", async function () {
      // Register a new company
      const companyName = "Test Company";
      const minWeightRequirement = 100;
      const maxPricePerKg = 10;
      const isActive = true;

      await recycle.connect(company).registerCompany(
        companyName,
        minWeightRequirement,
        maxPricePerKg,
        isActive
      );

      // Ascertain that company is registered correctly
      const registeredCompany = await recycle.companies(company.address);
      expect(registeredCompany.name).to.equal(companyName);
      console.log("Company name: ", registeredCompany.name);
      expect(registeredCompany.minWeightRequirement).to.equal(minWeightRequirement);
      console.log("Minimum weight requirement: ", registeredCompany.minWeightRequirement.toString());
      console.log(`-----------------------------------------------`);
      expect(registeredCompany.maxPricePerKg).to.equal(maxPricePerKg);
      console.log("Maximum price per kg: ", registeredCompany.maxPricePerKg.toString());
      expect(registeredCompany.active).to.equal(isActive);
      console.log("Company active?: ", registeredCompany.active);
    });
  });


  // The following are tests on the getRegisteredCompanyCount function of the Recycle smart contract - line 175 of Recycle.sol
  describe("getRegisteredCompanyCount", function () {
    it("should return the correct count of registered companies", async function () {
      // Register a new company using the first signer
      const companyName1 = "Company 1";
      const minWeightRequirement1 = 100;
      const maxPricePerKg1 = 10;
      const isActive1 = true;

      await recycle.connect(company).registerCompany(
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

      await recycle.connect(secondCompany).registerCompany(
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

      await recycle.connect(thirdCompany).registerCompany(
        companyName3,
        minWeightRequirement3,
        maxPricePerKg3,
        isActive3
      );

      // Get the registered company count
      const registeredCompanyCount = await recycle.getRegisteredCompanyCount();

      // Log key details to the console
      console.log("Registered Company Count:", registeredCompanyCount.toNumber());

      // Check if the count corresponds to what is expected.
      expect(registeredCompanyCount).to.equal(3);
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

      await recycle.connect(company).registerCompany(
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
      console.log("Updated company active status on first check: ", updatedCompany.active);

      // A counter-update of the active status of the company - Second check
      const newerActiveStatus = true;
      await recycle.connect(company).updateCompanyActiveStatus(newerActiveStatus);

      // Ascertain that the active status is counter-updated correctly
      const updatedCompanyCheckTwo = await recycle.companies(company.address);
      expect(updatedCompanyCheckTwo.active).to.equal(newerActiveStatus);
      console.log("Updated company active status on second check: ", updatedCompanyCheckTwo.active);
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
      const connectedcompany = await recycle.connect(company)
      //Call the contract function
      const registerCompany = await connectedcompany.registerCompany(
        companyName,
        minWeightRequirement,
        maxPricePerKg,
        isActive
      );

      await registerCompany.wait(1)

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
        newIsActive)

      const receipt = await editCompany.wait(1)

      // Check if the function emits events with these values
      expect(editCompany, 'CompanyEdited', {
        arg1: newCompanyName,
        arg2: newMinWeightRequirement,
        arg3: newMaxPricePerKg,
        arg4: newIsActive
      });
      //~~ You can also use receipt.events[0].args to check for events      
    });
  });

});
