const { expect } = require("chai");

describe("Recycle", function () {
  let recycle;
  let recCoin;
  let company;

  beforeEach(async function () {
    let _decimals = 18;
    const initialSupply = BigInt(1000);
    
    // Get the ContractFactory and Signers.
    RecCoin = await ethers.getContractFactory("RecCoin");
    [owner, company, company1, company2, ...companys] = await ethers.getSigners();

    // Deploy the RecCoin contract
    recCoin = await RecCoin.deploy("RecCoin", "REC", initialSupply);

    console.log("RecCoin contract successfully deployed");

    const Recycle = await ethers.getContractFactory("Recycle");
    recycle = await Recycle.deploy(recCoin.address);
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

      await recycle.connect(company).registerCompany(
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

      await recycle.connect(company).registerCompany(
        companyName,
        minWeightRequirement,
        maxPricePerKg,
        isActive
      );

      await expect(
        recycle.connect(company).registerCompany(
          companyName,
          minWeightRequirement,
          maxPricePerKg,
          isActive
        )
      ).to.be.revertedWith("Sorry you can't register twice edit your info if you wish to");
    });
  });

  // attempt to edit details of a pre-registered company
  describe("editCompany", function () {
    it("should edit an existing company", async function () {
      const newCompanyName = "New Company";
      const newMinWeightRequirement = 200;
      const newMaxPricePerKg = 20;
      const newIsActive = false;

      await recycle.connect(company).registerCompany(
        "Company A",
        100,
        10,
        true
      );

      await recycle.connect(company).editCompany(
        newCompanyName,
        newMinWeightRequirement,
        newMaxPricePerKg,
        newIsActive
      );

      const editedCompany = await recycle.companies(company.address);
      expect(editedCompany.name).to.equal(newCompanyName);
      expect(editedCompany.minWeightRequirement).to.equal( newMinWeightRequirement );
      expect(editedCompany.maxPricePerKg).to.equal(newMaxPricePerKg);
      expect(editedCompany.active).to.equal(newIsActive);
    });

    // ascertain that editing cannot be done for a non-registered company
    it("should revert if company is not pre-registered", async function () {
      await expect(
        recycle.connect(company).editCompany(
          "New Company",
          200,
          20,
          false
        )
      ).to.be.revertedWith("Only a registered company can perform this action");
    });
  });
});
