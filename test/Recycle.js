// Import necessary libraries
const { expect } = require("chai");

// Define contract artifacts
const { ethers } = require("hardhat");
const { utils } = ethers;

describe("Recycle", function () {
    let owner;
    let recycle;
    let company;
    let picker;

  beforeEach(async function () {
    // Deploy the contract and get the deployed instances
    // Assign test accounts to key players (owner, company, picker) in this contract 
    [owner, company, picker] = await ethers.getSigners();
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
      
    });
  });
  
  });
