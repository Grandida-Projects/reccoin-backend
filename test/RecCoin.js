const { expect } = require("chai");

describe("RecCoin", function() {
  let RecCoin;
  let recCoin;
  let owner;
  let account1;
  let account2;
  let accountss;

  const initialSupply = ethers.utils.parseEther("1000");

  beforeEach(async function() {
    // To get the ContractFactory and Signers.
    RecCoin = await ethers.getContractFactory("RecCoin");
    [owner, account1, account2, ...accountss] = await ethers.getSigners();

    // Deploy the RecCoin contract
    recCoin = await RecCoin.connect(owner).deploy("RecCoin", "REC", 18, initialSupply);
  });
  
  // Test to asscertain that owner is rightly set
  describe("Deployment", function() {
    it("Should set the right owner", async function() {
      expect(await recCoin.owner()).to.equal(owner.address); 
    });

    // Test to asscertain the correct total supply of RecCoin.
    it("Should set the correct total supply", async function() {
      expect(await recCoin.totalSupply()).to.equal(initialSupply);
    });

    // Test to asscertain that total supply of RecCoin is assigned to owner.
    it("Should assign the total supply to the owner", async function() {
      expect(await recCoin.balanceOf(owner.address)).to.equal(initialSupply);
    });
  });
});